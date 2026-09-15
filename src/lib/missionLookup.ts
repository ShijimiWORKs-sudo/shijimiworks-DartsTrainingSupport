import type { MissionMaster } from '../types';

export function MISSION_MASTER_BY_ID(masters: MissionMaster[], id: string): MissionMaster | undefined {
  return masters.find((m) => m.id === id);
}
