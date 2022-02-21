import { FastifyReply, FastifyRequest } from "fastify";

/**
 * GET one row from DB
 * @param {*} req
 * @param {*} res
 */

export const getAll = async (req: FastifyRequest, res: FastifyReply) => {
    const result = { hello: 'Test GET getAll' };
    res.send(result);
};

export const getOne = async (req: FastifyRequest, res: FastifyReply) => {
    const result = { hello: 'Test GET getId' };
    res.send(result);

};

export const findId = async (req: FastifyRequest | any, res: FastifyReply | any) => {
    const result = { hello: 'Test post getId' };
    res.send(result);    
};

export const update = async (req: FastifyRequest, res: FastifyReply) => {
    const result = { hello: 'Test put' };
    res.send(result);
};

export const deleteTest = async (req: FastifyRequest, res: FastifyReply) => {
    const result = { hello: 'Test delete' };
    res.send(result);
  };
  