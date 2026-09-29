import type { Request, Response, NextFunction } from "express";
import { restorationStepService } from "../services/RestorationStepService";

const wrap = (handler: (req: Request, res: Response) => unknown) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = handler(req, res);
      return result instanceof Promise ? result.then(undefined, next) : result;
    } catch (error) {
      return next(error);
    }
  };

export const restorationStepController = {
  list: wrap((_req, res) => res.json(restorationStepService.list())),
  create: wrap((req, res) => res.status(201).json(restorationStepService.create(req.body))),
  correct: wrap((req, res) => res.json(restorationStepService.correct(Number(req.params.id), req.body)))
};
