import {
    ExternalInteractorBase,
    HoverMode,
    getDistance,
    getLinkColor,
    getLinkRandomColor,
    isInArray,
    mouseMoveEvent,
} from "tsparticles-engine";
import type { Container } from "tsparticles-engine";

/**
 * Particle grab manager
 * @category Interactions
 */
export class Grabber extends ExternalInteractorBase {
    constructor(container: Container) {
        super(container);
    }

    isEnabled(): boolean {
        const container = this.container,
            mouse = container.interactivity.mouse,
            events = container.actualOptions.interactivity.events;

        return events.onHover.enable && !!mouse.position && isInArray(HoverMode.grab, events.onHover.mode);
    }

    reset(): void {
        // do nothing
    }

    async interact(): Promise<void> {
        const container = this.container,
            options = container.actualOptions,
            interactivity = options.interactivity;

        if (!interactivity.events.onHover.enable || container.interactivity.status !== mouseMoveEvent) {
            return;
        }

        const mousePos = container.interactivity.mouse.position;

        if (!mousePos) {
            return;
        }

        const distance = container.retina.grabModeDistance,
            query = container.particles.quadTree.queryCircle(mousePos, distance);

        for (const particle of query) {
            /*
               draw a line between the cursor and the particle
               if the distance between them is under the config distance
            */
            const pos = particle.getPosition(),
                pointDistance = getDistance(pos, mousePos);

            if (pointDistance > distance) {
                continue;
            }

            const grabLineOptions = interactivity.modes.grab.links,
                lineOpacity = grabLineOptions.opacity,
                opacityLine = lineOpacity - (pointDistance * lineOpacity) / distance;

            if (opacityLine <= 0) {
                continue;
            }

            const optColor = grabLineOptions.color ?? particle.options.links.color;

            if (!container.particles.grabLineColor) {
                const linksOptions = options.interactivity.modes.grab.links;

                container.particles.grabLineColor = getLinkRandomColor(
                    optColor,
                    linksOptions.blink,
                    linksOptions.consent
                );
            }

            const colorLine = getLinkColor(particle, undefined, container.particles.grabLineColor);

            if (!colorLine) {
                return;
            }

            container.canvas.drawGrabLine(particle, colorLine, opacityLine, mousePos);
        }
    }
}
