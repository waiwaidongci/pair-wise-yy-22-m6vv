import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import { stabilityObservationService } from "./StabilityObservationService";
import { HttpError } from "../utils/httpError";

type Actor = { id: number; role: string };

export const imageVersionService = {
  list: () => imageVersionRepository.findAll(),
  create: (row: Record<string, unknown>) => imageVersionRepository.save(row as never),
  update(id: number, patch: Record<string, unknown>, actor: Actor) {
    const row = imageVersionRepository.findById(id);
    if (!row) throw new HttpError("SOURCE_NOT_FOUND", 404, `image_id=${id}`);
    const updated = imageVersionRepository.update(id, patch);
    // An image corrected/replaced after review voids the old conclusion too.
    stabilityObservationService.invalidateForPlan(Number(row.plan_id), "外观影像", actor, `影像#${id} 更正`);
    return updated;
  }
};
