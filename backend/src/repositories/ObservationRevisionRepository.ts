import { stabilityObservationRepository } from "./StabilityObservationRepository";
import type { ObservationRevision } from "../models/ObservationRevision";

export const observationRevisionRepository = {
  findAll: (): ObservationRevision[] =>
    stabilityObservationRepository.findAll().flatMap((row) => row.revisions),
  findByObservation: (observationId: number): ObservationRevision[] => {
    const row = stabilityObservationRepository.findById(observationId);
    return row ? row.revisions : [];
  },
  nextId: () => stabilityObservationRepository.nextRevisionId(),
  save: (observationId: number, revision: ObservationRevision) =>
    stabilityObservationRepository.appendRevision(observationId, revision)
};
