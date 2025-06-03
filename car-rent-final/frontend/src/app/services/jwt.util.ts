export function createMockJwt(payload: object): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const base64 = (obj: any) => btoa(JSON.stringify(obj));
    return `${base64(header)}.${base64(payload)}.signature`;
  }
  