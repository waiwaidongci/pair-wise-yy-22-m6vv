import { stabilityObservationRepository } from "./StabilityObservationRepository";
import type { ObservationCheckpoint } from "../models/ObservationCheckpoint";

export const observationCheckpointRepository = {
  findAll: (): ObservationCheckpoint[] =>
    stabilityObservationRepository.findAll().flatMap((row) => row.checkpoints),
  findByObservation: (observationId: number): ObservationCheckpoint[] => {
    const row = stabilityObservationRepository.findById(observationId);
    return row ? row.checkpoints : [];
  },
  nextId: () => stabilityObservationRepository.nextCheckpointId(),
  save: (observationId: number, checkpoint: ObservationCheckpoint) =>
    stabilityObservationRepository.appendCheckpoint(observationId, checkpoint)
};
