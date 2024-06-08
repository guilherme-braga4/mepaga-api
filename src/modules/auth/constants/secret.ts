export const jwtConstants = {
  secret_access: process.env.SECRET_JWT,
  secret_refresh: process.env.SECRET_JWT_REFRESH,
};

export const passwordConstants = {
  secret: process.env.SECRET_PASSWORD,
};
