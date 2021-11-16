export interface RespuestaServidor {
  succeeded: boolean;
  message: string;
  errors: [string];
  data: string;
}
