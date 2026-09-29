import type { Request, Response, NextFunction } from "express";
import { imageVersionService } from "../services/ImageVersionService";

const wrap = (handler: (req: Request, res: Response) => unknown) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = handler(req, res);
      return result instanceof Promise ? result.then(undefined, next) : result;
    } catch (error) {
      return next(error);
    }
  };

export const imageVersionController = {
  list: wrap((_req, res) => res.json(imageVersionService.list())),
  create: wrap((req, res) => res.status(201).json(imageVersionService.create(req.body))),
  correct: wrap((req, res) => res.json(imageVersionService.correct(Number(req.params.id), req.body)))
};
