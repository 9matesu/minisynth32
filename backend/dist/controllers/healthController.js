export class HealthController {
    serial;
    constructor(serial) {
        this.serial = serial;
    }
    show = (_req, res) => {
        res.json({
            ok: true,
            service: 'minisynth32-backend',
            serial: this.serial.getStatus(),
        });
    };
}
//# sourceMappingURL=healthController.js.map