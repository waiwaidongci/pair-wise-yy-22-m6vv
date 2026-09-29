import type { Request, Response, NextFunction } from "express";
import { restorationPlanService } from "../services/RestorationPlanService";

const wrap = (handler: (req: Request, res: Response) => unknown) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = handler(req, res);
      return result instanceof Promise ? result.then(undefined, next) : result;
    } catch (error) {
      return next(error);
    }
  };

export const restorationPlanController = {
  list: wrap((_req, res) => res.json(restorationPlanService.list())),
  create: wrap((req, res) => res.status(201).json(restorationPlanService.create(req.body))),
  archiveGate: wrap((req, res) => res.json(restorationPlanService.archiveGate(Number(req.params.id)))),
  archive: wrap((req, res) => {
    const gate = restorationPlanService.archive(Number(req.params.id));
    return res.status(gate.archive_allowed ? 200 : 409).json(gate);
  })
};
