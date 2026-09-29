import type { Request, Response, NextFunction } from "express";
import { imageVersionService } from "../services/ImageVersionService";
import { HttpError } from "../utils/httpError";

const actorOf = (req: Request) => (req as unknown as { user: { id: number; role: string } }).user;

const wrap = (handler: (req: Request, res: Response) => unknown) => (req: Request, res: Response, next: NextFunction) => {
  try {
    return handler(req, res);
  } catch (error) {
    if (error instanceof HttpError) return res.status(error.status).json({ code: error.code, message: error.message });
    return next(error);
  }
};

export const imageVersionController = {
  list: wrap((_req, res) => res.json(imageVersionService.list())),
  create: wrap((req, res) => res.status(201).json(imageVersionService.create(req.body))),
  update: wrap((req, res) => res.json(imageVersionService.update(Number(req.params.id), req.body, actorOf(req))))
};
