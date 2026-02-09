/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Firebird from 'node-firebird';

export interface UkrSkladStore {
  NUM: number;
  ADDRESS: string;
}

export interface UkrSkladCategory {
  NUM: number;
  NAME: string;
}

export interface UkrSkladProduct {
  NUM: number;
  NAME: string;
  PRICE: number;
  PRICE_PROMO: number;
  UNIT: string;
  CATEGORY_ID: number;
}

export interface UkrSkladStock {
  PRODUCT_ID: number;
  STORE_ID: number;
  QUANTITY: number;
}

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

  private formatIds(ids: number[]): string {
    return ids.length > 0 ? ids.join(',') : 'null';
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      Firebird.attach(this.options, (err, db) => {
        if (err) {
          this.logger.error(`Firebird connection error: ${err.message}`);
          return reject(err instanceof Error ? err : new Error(String(err)));
        }
        db.query(sql, params, (err, result) => {
          db.detach();
          if (err) {
            this.logger.error(`Firebird query error: ${err.message}`);
            return reject(err instanceof Error ? err : new Error(String(err)));
          }
          resolve(result as T[]);
        });
      });
    });
  }

  async getCategories(): Promise<UkrSkladCategory[]> {
    this.logger.verbose('Getting categories from UkrSklad...');
    return this.query<UkrSkladCategory>(
      'SELECT NUM, NAME FROM TIP WHERE VISIBLE = 1 AND CHAR_LENGTH(SKLAD_ID) > 0',
    );
  }

  async getStores(): Promise<UkrSkladStore[]> {
    this.logger.verbose('Getting stores from UkrSklad...');
    return this.query<UkrSkladStore>(
      'SELECT NUM, NAME AS ADDRESS FROM SKLAD_NAMES WHERE VISIBLE = 1',
    );
  }

  async getProducts(ids?: number[]): Promise<UkrSkladProduct[]> {
    this.logger.verbose('Getting products from UkrSklad...');
    let sql = `
      SELECT 
        NUM, 
        NAME, 
        CENA_R as PRICE,
        CENA_PROMO as PRICE_PROMO,
        ED_IZM as UNIT, 
        TIP as CATEGORY_ID
      FROM TOVAR_NAME
      WHERE VISIBLE = 1
      AND IS_USLUGA = 0
      AND TIP IS NOT NULL
      AND CENA_R > 0
      AND NAME != 'Мій товар'
    `;

    if (ids && ids.length > 0) {
      sql += ` AND NUM IN (${this.formatIds(ids)})`;
    }

    return this.query<UkrSkladProduct>(sql);
  }

  async getProductStock(ids?: number[]): Promise<UkrSkladStock[]> {
    this.logger.verbose('Getting stocks from UkrSklad...');

    let sql = `
      SELECT 
        TOVAR_ID as PRODUCT_ID,
        SKLAD_ID as STORE_ID,
        KOLVO as QUANTITY
      FROM TOVAR_ZAL
      WHERE KOLVO >= 0
    `;

    if (ids && ids.length > 0) {
      sql += ` AND TOVAR_ID IN (${this.formatIds(ids)})`;
    }

    return this.query<UkrSkladStock>(sql);
  }
}
