import type { Request, Response, NextFunction } from "express";
import { restorationPlanService } from "../services/RestorationPlanService";
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

export const restorationPlanController = {
  list: wrap((_req, res) => res.json(restorationPlanService.list())),
  create: wrap((req, res) => res.status(201).json(restorationPlanService.create(req.body))),
  archive: wrap((req, res) => res.json(restorationPlanService.archive(Number(req.params.id), actorOf(req))))
};
