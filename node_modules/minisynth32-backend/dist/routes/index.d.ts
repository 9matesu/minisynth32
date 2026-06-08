import type { HealthController } from '../controllers/healthController.js';
import type { MidiMappingController } from '../controllers/midiMappingController.js';
import type { PresetController } from '../controllers/presetController.js';
import type { SynthController } from '../controllers/synthController.js';
export interface RouteControllers {
    health: HealthController;
    presets: PresetController;
    midiMappings: MidiMappingController;
    synth: SynthController;
}
export declare const createApiRouter: (controllers: RouteControllers) => import("express-serve-static-core").Router;
