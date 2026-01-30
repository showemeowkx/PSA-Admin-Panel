/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Firebird from 'node-firebird';

@Injectable()
export class UkrSkladService {
  private readonly logger = new Logger(UkrSkladService.name);
  private options: Firebird.Options;

  constructor(private readonly configService: ConfigService) {
    this.options = {
      host: this.configService.get<string>('UKRSKLAD_DB_HOST', '127.0.0.1'),
      port: this.configService.get<number>('UKRSKLAD_DB_PORT', 3050),
      database: this.configService.get<string>(
        'UKRSKLAD_DB_PATH',
        'C:\\UkrSklad\\db\\ubase.fdb',
      ),
      user: this.configService.get<string>('UKRSKLAD_DB_USER', 'SYSDBA'),
      password: this.configService.get<string>(
        'UKRSKLAD_DB_PASSWORD',
        'masterkey',
      ),
      lowercase_keys: false,
      role: undefined,
      pageSize: 4096,
    };
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      Firebird.attach(this.options, (err, db) => {
        if (err) {
          this.logger.error(`Firebird Connection Error: ${err.message}`);
          return reject(err instanceof Error ? err : new Error(String(err)));
        }
        db.query(sql, params, (err, result) => {
          db.detach();
          if (err) {
            this.logger.error(`Firebird Query Error: ${err.message}`);
            return reject(err instanceof Error ? err : new Error(String(err)));
          }
          resolve(result as T[]);
        });
      });
    });
  }
}
