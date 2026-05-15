import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Prisma before importing the controller so the top-level constructor calls
// receive the mock implementation when the module is first evaluated.
const mockPrisma = {
  user: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: function PrismaClient() {
    return mockPrisma;
  },
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: function PrismaPg() {},
}));

const { createUser, getUsers, getUser, updateUser, deleteUser } = await import(
  '../controllers/userController.js'
);

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function mockReqRes(body = {}, params = {}) {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return { req: { body, params }, res };
}

const validUserBody = { nome: 'Lucas', idade: 25, email: 'lucas@example.com' };
const fakeUser = { id: 1, ...validUserBody, createdAt: new Date() };

// ---------------------------------------------------------------------------
// createUser
// ---------------------------------------------------------------------------

describe('createUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 201 with the created user on valid body', async () => {
    mockPrisma.user.create.mockResolvedValue(fakeUser);
    const { req, res } = mockReqRes(validUserBody);

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  it('returns 400 when a required field is missing', async () => {
    const { req, res } = mockReqRes({ nome: 'Lucas', email: 'lucas@example.com' }); // no idade

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Dados inválidos' })
    );
  });

  it('returns 400 when email is invalid', async () => {
    const { req, res } = mockReqRes({ nome: 'Lucas', idade: 25, email: 'not-an-email' });

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Dados inválidos' })
    );
  });

  it('returns 400 when nome is empty string', async () => {
    const { req, res } = mockReqRes({ nome: '', idade: 25, email: 'lucas@example.com' });

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 409 when email is already registered (P2002)', async () => {
    const duplicateError = new Error('Unique constraint failed');
    duplicateError.code = 'P2002';
    mockPrisma.user.create.mockRejectedValue(duplicateError);
    const { req, res } = mockReqRes(validUserBody);

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email já cadastrado!' });
  });

  it('returns 500 on unexpected prisma error', async () => {
    mockPrisma.user.create.mockRejectedValue(new Error('DB crash'));
    const { req, res } = mockReqRes(validUserBody);

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
  });
});

// ---------------------------------------------------------------------------
// getUsers
// ---------------------------------------------------------------------------

describe('getUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with array of users', async () => {
    const users = [fakeUser, { ...fakeUser, id: 2, email: 'b@example.com' }];
    mockPrisma.user.findMany.mockResolvedValue(users);
    const { req, res } = mockReqRes();

    await getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(users);
  });

  it('returns 200 with empty array when no users exist', async () => {
    mockPrisma.user.findMany.mockResolvedValue([]);
    const { req, res } = mockReqRes();

    await getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('returns 500 when prisma throws', async () => {
    mockPrisma.user.findMany.mockRejectedValue(new Error('DB down'));
    const { req, res } = mockReqRes();

    await getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
  });
});

// ---------------------------------------------------------------------------
// getUser
// ---------------------------------------------------------------------------

describe('getUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with the user when found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(fakeUser);
    const { req, res } = mockReqRes({}, { id: '1' });

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  it('returns 400 for id "abc" (non-numeric)', async () => {
    const { req, res } = mockReqRes({}, { id: 'abc' });

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'ID inválido' });
  });

  it('returns 400 for id "0"', async () => {
    const { req, res } = mockReqRes({}, { id: '0' });

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'ID inválido' });
  });

  it('returns 400 for id "-1"', async () => {
    const { req, res } = mockReqRes({}, { id: '-1' });

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'ID inválido' });
  });

  it('returns 404 when user is not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const { req, res } = mockReqRes({}, { id: '99' });

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado' });
  });

  it('returns 500 when prisma throws', async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error('DB error'));
    const { req, res } = mockReqRes({}, { id: '1' });

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
  });
});

// ---------------------------------------------------------------------------
// updateUser
// ---------------------------------------------------------------------------

describe('updateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with updated user on valid request', async () => {
    const updatedUser = { ...fakeUser, nome: 'Lucas Updated' };
    mockPrisma.user.update.mockResolvedValue(updatedUser);
    const { req, res } = mockReqRes(validUserBody, { id: '1' });

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedUser);
  });

  it('returns 400 for invalid id', async () => {
    const { req, res } = mockReqRes(validUserBody, { id: 'abc' });

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'ID inválido' });
  });

  it('returns 400 for id "0"', async () => {
    const { req, res } = mockReqRes(validUserBody, { id: '0' });

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when body is missing a required field', async () => {
    const { req, res } = mockReqRes({ nome: 'Lucas' }, { id: '1' }); // no idade, no email

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Dados inválidos' })
    );
  });

  it('returns 400 when idade is not a positive integer', async () => {
    const { req, res } = mockReqRes(
      { nome: 'Lucas', idade: -5, email: 'lucas@example.com' },
      { id: '1' }
    );

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when user is not found (P2025)', async () => {
    const notFoundError = new Error('Record not found');
    notFoundError.code = 'P2025';
    mockPrisma.user.update.mockRejectedValue(notFoundError);
    const { req, res } = mockReqRes(validUserBody, { id: '99' });

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado!' });
  });

  it('returns 409 when email conflicts with another user (P2002)', async () => {
    const duplicateError = new Error('Unique constraint failed');
    duplicateError.code = 'P2002';
    mockPrisma.user.update.mockRejectedValue(duplicateError);
    const { req, res } = mockReqRes(validUserBody, { id: '1' });

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email já cadastrado!' });
  });

  it('returns 500 on unexpected prisma error', async () => {
    mockPrisma.user.update.mockRejectedValue(new Error('DB crash'));
    const { req, res } = mockReqRes(validUserBody, { id: '1' });

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
  });
});

// ---------------------------------------------------------------------------
// deleteUser
// ---------------------------------------------------------------------------

describe('deleteUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with success message on valid deletion', async () => {
    mockPrisma.user.delete.mockResolvedValue(fakeUser);
    const { req, res } = mockReqRes({}, { id: '1' });

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuário deletado!' });
  });

  it('returns 400 for id "abc"', async () => {
    const { req, res } = mockReqRes({}, { id: 'abc' });

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'ID inválido' });
  });

  it('returns 400 for id "0"', async () => {
    const { req, res } = mockReqRes({}, { id: '0' });

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'ID inválido' });
  });

  it('returns 400 for id "-1"', async () => {
    const { req, res } = mockReqRes({}, { id: '-1' });

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'ID inválido' });
  });

  it('returns 404 when user is not found (P2025)', async () => {
    const notFoundError = new Error('Record not found');
    notFoundError.code = 'P2025';
    mockPrisma.user.delete.mockRejectedValue(notFoundError);
    const { req, res } = mockReqRes({}, { id: '99' });

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado!' });
  });

  it('returns 500 on unexpected prisma error', async () => {
    mockPrisma.user.delete.mockRejectedValue(new Error('DB crash'));
    const { req, res } = mockReqRes({}, { id: '1' });

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
  });
});
