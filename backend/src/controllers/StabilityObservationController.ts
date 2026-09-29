import type { Request, Response, NextFunction } from "express";
import { stabilityObservationService } from "../services/StabilityObservationService";
import { HttpError } from "../utils/httpError";

const actorOf = (req: Request) => (req as unknown as { user: { id: number; role: string } }).user;

const wrap = (handler: (req: Request, res: Response) => unknown) => (req: Request, res: Response, next: NextFunction) => {
  try {
    return handler(req, res);
  } catch (error) {
    // Controllers must wrap separately instead of relying on the global handler.
    if (error instanceof HttpError) {
      return res.status(error.status).json({ code: error.code, message: error.message });
    }
    return next(error);
  }
};

export const stabilityObservationController = {
  list: wrap((_req, res) => res.json(stabilityObservationService.list())),
  detail: wrap((req, res) => {
    const row = stabilityObservationService.getById(Number(req.params.id));
    if (!row) throw new HttpError("OBSERVATION_NOT_FOUND", 404);
    res.json(row);
  }),
  create: wrap((req, res) => res.status(201).json(stabilityObservationService.createSheet(req.body, actorOf(req)))),
  registerEntry: wrap((req, res) =>
    res.status(201).json(stabilityObservationService.registerEntry(Number(req.params.id), req.body, actorOf(req)))
  ),
  finish: wrap((req, res) => res.json(stabilityObservationService.finishObservation(Number(req.params.id), actorOf(req)))),
  review: wrap((req, res) => res.json(stabilityObservationService.review(Number(req.params.id), req.body, actorOf(req))))
};
