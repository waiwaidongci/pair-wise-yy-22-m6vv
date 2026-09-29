import type { Request, Response, NextFunction } from "express";
import { stabilityObservationService } from "../services/StabilityObservationService";

const wrap = (handler: (req: Request, res: Response) => unknown) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = handler(req, res);
      return result instanceof Promise ? result.then(undefined, next) : result;
    } catch (error) {
      return next(error);
    }
  };

export const stabilityObservationController = {
  list: wrap((_req, res) => res.json(stabilityObservationService.list())),
  detail: wrap((req, res) => res.json(stabilityObservationService.detail(Number(req.params.id)))),
  open: wrap((req, res) => res.status(201).json(stabilityObservationService.open(req.body))),
  registerCheckpoint: wrap((req, res) =>
    res.status(201).json(stabilityObservationService.registerCheckpoint(Number(req.params.id), req.body))
  ),
  finish: wrap((req, res) => res.json(stabilityObservationService.finish(Number(req.params.id), req.body))),
  review: wrap((req, res) => res.json(stabilityObservationService.review(Number(req.params.id), req.body))),
  recalculate: wrap((req, res) => res.json(stabilityObservationService.recalculate(Number(req.params.id)))),
  revisions: wrap((req, res) => res.json(stabilityObservationService.revisions(Number(req.params.id)))),
  checkpoints: wrap((req, res) => res.json(stabilityObservationService.checkpoints(Number(req.params.id))))
};
