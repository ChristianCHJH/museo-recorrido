import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { SeccionBloqueEntidad } from './entidades/seccion-bloque.entidad';
import { ActualizarBloqueDto, BloqueDto, GuardarBloquesDto, ItemOrdenBloqueDto } from './dto/bloque.dto';
import { validarConfigBloque } from './validadores/validadores-bloques';

@Injectable()
export class SeccionesBloquesServicio {
  constructor(
    @InjectModel(SeccionBloqueEntidad)
    private readonly modelo: typeof SeccionBloqueEntidad,
    @InjectConnection()
    private readonly sequelize: Sequelize,
  ) {}

  async obtenerPorSeccion(seccionId: string): Promise<SeccionBloqueEntidad[]> {
    return this.modelo.findAll({
      where: { seccionId, eliminado: false },
      order: [['orden', 'ASC']],
    });
  }

  async guardarLote(seccionId: string, dto: GuardarBloquesDto): Promise<SeccionBloqueEntidad[]> {
    for (const bloque of dto.bloques) {
      validarConfigBloque(bloque.tipo, bloque.config);
    }

    const idsEnviados = dto.bloques
      .filter((b) => !!b.id)
      .map((b) => b.id as string);

    await this.sequelize.transaction(async (t) => {
      await this.modelo.update(
        { eliminado: true, actualizadoEn: new Date() },
        {
          where: {
            seccionId,
            eliminado: false,
            ...(idsEnviados.length > 0 ? { id: { [Op.notIn]: idsEnviados } } : {}),
          },
          transaction: t,
        },
      );

      for (const bloqueDto of dto.bloques) {
        if (bloqueDto.id) {
          const [filasActualizadas] = await this.modelo.update(
            {
              tipo: bloqueDto.tipo,
              orden: bloqueDto.orden,
              config: bloqueDto.config,
              estado: bloqueDto.estado ?? true,
              actualizadoEn: new Date(),
            },
            { where: { id: bloqueDto.id, seccionId }, transaction: t },
          );

          if (filasActualizadas === 0) {
            await this.modelo.create(
              {
                id: bloqueDto.id,
                seccionId,
                tipo: bloqueDto.tipo,
                orden: bloqueDto.orden,
                config: bloqueDto.config,
                estado: bloqueDto.estado ?? true,
              } as any,
              { transaction: t },
            );
          }
        } else {
          await this.modelo.create(
            {
              seccionId,
              tipo: bloqueDto.tipo,
              orden: bloqueDto.orden,
              config: bloqueDto.config,
              estado: bloqueDto.estado ?? true,
            } as any,
            { transaction: t },
          );
        }
      }
    });

    return this.obtenerPorSeccion(seccionId);
  }

  async crear(seccionId: string, dto: BloqueDto): Promise<SeccionBloqueEntidad> {
    validarConfigBloque(dto.tipo, dto.config);
    return this.modelo.create(
      {
        seccionId,
        tipo: dto.tipo,
        orden: dto.orden,
        config: dto.config,
        estado: dto.estado ?? true,
      } as any,
    );
  }

  async actualizar(bloqueId: string, dto: ActualizarBloqueDto): Promise<SeccionBloqueEntidad> {
    const bloque = await this.obtenerPorId(bloqueId);
    if (dto.config !== undefined) {
      validarConfigBloque(bloque.tipo, dto.config);
    }
    return bloque.update({ ...dto, actualizadoEn: new Date() } as any);
  }

  async eliminar(bloqueId: string): Promise<void> {
    const bloque = await this.obtenerPorId(bloqueId);
    await bloque.update({ eliminado: true, actualizadoEn: new Date() });
  }

  async reordenar(items: ItemOrdenBloqueDto[]): Promise<void> {
    await this.sequelize.transaction(async (t) => {
      for (const item of items) {
        await this.modelo.update(
          { orden: item.orden, actualizadoEn: new Date() },
          { where: { id: item.id, eliminado: false }, transaction: t },
        );
      }
    });
  }

  private async obtenerPorId(id: string): Promise<SeccionBloqueEntidad> {
    const bloque = await this.modelo.findOne({ where: { id, eliminado: false } });
    if (!bloque) {
      throw new NotFoundException(`Bloque con id ${id} no encontrado`);
    }
    return bloque;
  }
}
