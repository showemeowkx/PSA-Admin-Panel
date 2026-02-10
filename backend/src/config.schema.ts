import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  MIN_ORDER_AMNT: Joi.number().default(500),

  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_HOST: Joi.string().default('postgres'),
  POSTGRES_PORT: Joi.number().default(5352),

  PORT: Joi.number().default(3000),

  REDIS_HOST: Joi.string().default('cache'),
  REDIS_PORT: Joi.number().default(6379),
  CACHE_TTL_MILISECONDS: Joi.string().default(3600000),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRE_TIME: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRE_TIME: Joi.string().default('7d'),

  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),

  DEFAULT_CATEGORY_ICON: Joi.string().default(
    'https://res.cloudinary.com/dgsoaci96/image/upload/v1769197677/default_category.png',
  ),
  DEFAULT_USER_PFP: Joi.string().default(
    'https://res.cloudinary.com/dgsoaci96/image/upload/v1769207269/user_default_i73dfk.jpg',
  ),
  DEFAULT_PRODUCT_IMAGE: Joi.string().default(
    'https://res.cloudinary.com/dgsoaci96/image/upload/v1769209222/product_default_pzutee.jpg',
  ),

  UKRSKLAD_DB_HOST: Joi.string().default('host.docker.internal'),
  UKRSKLAD_DB_PORT: Joi.number().default(3050),
  UKRSKLAD_DB_PATH: Joi.string().required(),
  UKRSKLAD_DB_USER: Joi.string().default('SYSDBA'),
  UKRSKLAD_DB_PASSWORD: Joi.string().default('masterkey'),

  VERIFICATION_CODE_EXPIRE_MINUTES: Joi.number().default(5),
  TURBOSMS_TOKEN: Joi.string().required(),
  TURBOSMS_SENDER: Joi.string().required(),
});
