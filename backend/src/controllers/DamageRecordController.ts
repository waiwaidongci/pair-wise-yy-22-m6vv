import type { Request, Response, NextFunction } from "express";
import { damageRecordService } from "../services/DamageRecordService";

const wrap = (handler: (req: Request, res: Response) => unknown) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = handler(req, res);
      return result instanceof Promise ? result.then(undefined, next) : result;
    } catch (error) {
      return next(error);
    }
  };

export const damageRecordController = {
  list: wrap((_req, res) => res.json(damageRecordService.list())),
  create: wrap((req, res) => res.status(201).json(damageRecordService.create(req.body))),
  correct: wrap((req, res) => res.json(damageRecordService.correct(Number(req.params.id), req.body)))
};
