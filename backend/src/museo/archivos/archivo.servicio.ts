import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const TIPOS_PERMITIDOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const TIPOS_PERMITIDOS_VIDEO = ['video/mp4', 'video/webm', 'video/ogg'];
const TIPOS_PERMITIDOS_AUDIO = ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/aac'];
const TIPOS_PERMITIDOS = [...TIPOS_PERMITIDOS_IMAGEN, ...TIPOS_PERMITIDOS_VIDEO, ...TIPOS_PERMITIDOS_AUDIO];
const LIMITE_BYTES = 200 * 1024 * 1024; // 200 MB

export interface ResultadoGuardado {
  url: string;
  pesoBytes: number;
}

@Injectable()
export class ArchivoServicio {
  private readonly raizUploads = path.join(process.cwd(), 'uploads');

  async guardar(
    archivo: Express.Multer.File,
    entidad: string,
    id: string,
  ): Promise<ResultadoGuardado> {
    if (!archivo) throw new BadRequestException('No se recibió ningún archivo');
    if (!TIPOS_PERMITIDOS.includes(archivo.mimetype)) {
      throw new BadRequestException(`Tipo de archivo no permitido: ${archivo.mimetype}`);
    }
    if (archivo.size > LIMITE_BYTES) {
      throw new BadRequestException('El archivo supera el límite de 200 MB');
    }

    const ext = path.extname(archivo.originalname).toLowerCase();
    const nombreArchivo = `${uuidv4()}${ext}`;
    const directorio = path.join(this.raizUploads, entidad, id);

    fs.mkdirSync(directorio, { recursive: true });
    fs.writeFileSync(path.join(directorio, nombreArchivo), archivo.buffer);

    const url = `/uploads/${entidad}/${id}/${nombreArchivo}`;
    return { url, pesoBytes: archivo.size };
  }

  eliminar(urlRelativa: string): void {
    const rutaAbsoluta = path.join(process.cwd(), urlRelativa);
    if (fs.existsSync(rutaAbsoluta)) {
      fs.unlinkSync(rutaAbsoluta);
    }
  }
}
