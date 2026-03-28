export interface Slot {
  id: number;
  professional: string;
  startTime: number;
  endTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSlotInput {
  professional: string;
  startTime: number;
  endTime: number;
}

export interface UpdateSlotInput {
  professional?: string;
  startTime?: number;
  endTime?: number;
}

export class SlotValidationError extends Error {
  readonly statusCode = 400;
}

export class SlotNotFoundError extends Error {
  readonly statusCode = 404;
}

export class SlotService {
  private slots = new Map<number, Slot>();
  private nextId = 1;
  private readonly now: () => Date;

  constructor(now: () => Date = () => new Date()) {
    this.now = now;
  }

  listSlots(): Slot[] {
    return Array.from(this.slots.values())
      .sort((a, b) => a.id - b.id)
      .map((slot) => ({ ...slot }));
  }

  createSlot(input: CreateSlotInput): Slot {
    const professional = this.validateProfessional(input.professional);
    const { startTime, endTime } = this.validateRange(input.startTime, input.endTime);
    const timestamp = this.now().toISOString();

    const slot: Slot = {
      id: this.nextId,
      professional,
      startTime,
      endTime,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.nextId += 1;
    this.slots.set(slot.id, slot);

    return { ...slot };
  }

  updateSlot(slotId: number, updates: UpdateSlotInput): Slot {
    if (!Number.isInteger(slotId) || slotId <= 0) {
      throw new SlotValidationError("slotId must be a positive integer");
    }

    if (!updates || typeof updates !== "object") {
      throw new SlotValidationError("update payload must be an object");
    }

    if (Object.keys(updates).length === 0) {
      throw new SlotValidationError("update payload must include at least one field");
    }

    const existingSlot = this.slots.get(slotId);

    if (!existingSlot) {
      throw new SlotNotFoundError(`Slot ${slotId} was not found`);
    }

    const nextProfessional =
      updates.professional !== undefined
        ? this.validateProfessional(updates.professional)
        : existingSlot.professional;

    const nextStartTime = updates.startTime ?? existingSlot.startTime;
    const nextEndTime = updates.endTime ?? existingSlot.endTime;
    const validatedRange = this.validateRange(nextStartTime, nextEndTime);

    const updatedSlot: Slot = {
      ...existingSlot,
      professional: nextProfessional,
      startTime: validatedRange.startTime,
      endTime: validatedRange.endTime,
      updatedAt: this.now().toISOString(),
    };

    this.slots.set(slotId, updatedSlot);
    return { ...updatedSlot };
  }

  reset(): void {
    this.slots.clear();
    this.nextId = 1;
  }

  private validateProfessional(value: unknown): string {
    if (typeof value !== "string") {
      throw new SlotValidationError("professional must be a string");
    }

    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new SlotValidationError("professional must be a non-empty string");
    }

    return normalizedValue;
  }

  private validateRange(startTime: unknown, endTime: unknown): { startTime: number; endTime: number } {
    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      throw new SlotValidationError("startTime and endTime must be finite numbers");
    }

    const normalizedStartTime = Number(startTime);
    const normalizedEndTime = Number(endTime);

    if (normalizedEndTime <= normalizedStartTime) {
      throw new SlotValidationError("endTime must be greater than startTime");
    }

    return { startTime: normalizedStartTime, endTime: normalizedEndTime };
  }
}

export const slotService = new SlotService();