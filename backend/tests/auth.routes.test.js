jest.mock("../src/services/auth.service", () => ({
  register: jest.fn(),
  login: jest.fn(),
  loginWithGoogle: jest.fn(),
  getMe: jest.fn(),
  refreshAccessToken: jest.fn(),
  logout: jest.fn(),
}));

const request = require("supertest");
const app = require("../src/app");
const authService = require("../src/services/auth.service");

describe("Auth routes validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects weak passwords on register", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Test User",
        email: "test@example.com",
        password: "123",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
    expect(response.body.errors.password).toBeDefined();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it("rejects invalid email on login", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "bad-email",
        password: "Password123",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
    expect(response.body.errors.email).toBeDefined();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it("requires refresh token for refresh endpoint", async () => {
    const response = await request(app)
      .post("/api/auth/refresh")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
    expect(response.body.errors.refreshToken).toBeDefined();
    expect(authService.refreshAccessToken).not.toHaveBeenCalled();
  });

  it("requires google id token for google login", async () => {
    const response = await request(app)
      .post("/api/auth/google")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
    expect(response.body.errors.idToken).toBeDefined();
    expect(authService.loginWithGoogle).not.toHaveBeenCalled();
  });
});
