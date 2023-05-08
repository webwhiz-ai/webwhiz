class JwtPayload {
  sub: string;
  email: string;
}

class JwtToken {
  access: string;
}

export { JwtPayload, JwtToken };
