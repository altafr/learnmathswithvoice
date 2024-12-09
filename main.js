import { Conversation } from '@11labs/client';

let conversation = null;
let isConnected = false;
let rotationX = 0;
let rotationY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let amplitude = 0;
let targetAmplitude = 0;
let baseRadius = 200;
let maxRadius = 300;
let sphereRadius = 200;
let targetRadius = 200;
let animationSpeed = 0.1;
let currentColors = {
    c1: [255, 140, 0],  // Orange
    c2: [255, 0, 128],  // Pink
    c3: [0, 191, 255]   // Blue
};
let targetColors = {
    c1: [255, 140, 0],
    c2: [255, 0, 128],
    c3: [0, 191, 255]
};

// Debug logging
function log(message, type = 'info') {
    const style = type === 'error' ? 'color: red' : 'color: green';
    console.log(`%c[ElevenLabs] ${message}`, style);
}

// Generate random color
function randomColor() {
    return [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256)
    ];
}

// Lerp between colors
function lerpColor(color1, color2, t) {
    return color1.map((c, i) => Math.floor(c + (color2[i] - c) * t));
}

// P5.js sketch
const sketch = (p) => {
    let sphereLines = [];
    const numLines = 25;

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        p.smooth();
        
        // Create sphere lines
        for (let i = 0; i < numLines; i++) {
            sphereLines.push(new SphereLine(i));
        }
    };

    p.draw = () => {
        p.background(42, 42, 114);
        p.orbitControl(0.5, 0.5);
        
        // Smooth transitions
        rotationX = p.lerp(rotationX, targetRotationX, 0.1);
        rotationY = p.lerp(rotationY, targetRotationY, 0.1);
        amplitude = p.lerp(amplitude, targetAmplitude, 0.1);
        sphereRadius = p.lerp(sphereRadius, targetRadius, animationSpeed);
        
        // Interpolate colors
        Object.keys(currentColors).forEach(key => {
            currentColors[key] = lerpColor(currentColors[key], targetColors[key], 0.1);
        });
        
        // Update points when radius changes
        if (Math.abs(targetRadius - sphereRadius) > 0.1) {
            sphereLines.forEach(line => line.generatePoints());
        }
        
        // Rotate sphere
        p.rotateX(rotationX);
        p.rotateY(rotationY + p.frameCount * 0.005);
        
        // Draw all lines
        sphereLines.forEach(line => line.draw());
        
        // Add continuous rotation
        targetRotationY += 0.001;
    };

    class SphereLine {
        constructor(index) {
            this.index = index;
            this.angle = (index / numLines) * p.PI;
            this.points = [];
            this.generatePoints();
        }

        generatePoints() {
            const steps = 50;
            this.points = [];
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const lat = t * p.PI * 2;
                
                // Add wave effect
                const waveOffset = p.sin(lat * 4 + p.frameCount * 0.05) * amplitude * 20;
                const currentRadius = sphereRadius + waveOffset;
                
                const x = currentRadius * p.cos(lat) * p.sin(this.angle);
                const y = currentRadius * p.sin(lat) * p.sin(this.angle);
                const z = currentRadius * p.cos(this.angle);
                this.points.push({ x, y, z });
            }
        }

        draw() {
            p.push();
            p.noFill();
            p.beginShape();
            
            for (let i = 0; i < this.points.length; i++) {
                const point = this.points[i];
                const t = i / (this.points.length - 1);
                
                // Interpolate between current colors
                let c;
                if (t < 0.5) {
                    const c1 = p.color(...currentColors.c1);
                    const c2 = p.color(...currentColors.c2);
                    c = p.lerpColor(c1, c2, t * 2);
                } else {
                    const c2 = p.color(...currentColors.c2);
                    const c3 = p.color(...currentColors.c3);
                    c = p.lerpColor(c2, c3, (t - 0.5) * 2);
                }
                
                p.stroke(c);
                p.strokeWeight(2 + amplitude);
                
                p.vertex(point.x, point.y, point.z);
            }
            p.endShape();
            p.pop();
        }
    }

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
};

// Create p5 instance
new p5(sketch);

// Initialize conversation
async function startConversation() {
    try {
        if (!isConnected) {
            document.getElementById('startButton').disabled = true;
            document.getElementById('stopButton').disabled = false;
            
            conversation = new Conversation({
                agentId: 'tUaecvJOneKgii2Vwv9q',
                connectionConfig: {
                    onDisconnect: () => {
                        isConnected = false;
                        document.getElementById('startButton').disabled = false;
                        document.getElementById('stopButton').disabled = true;
                        targetAmplitude = 0;
                        targetRadius = baseRadius;
                        log('Disconnected from agent');
                    },
                    onMessage: (message) => {
                        if (message.role === 'assistant') {
                            targetAmplitude = 1;
                            targetRadius = maxRadius;
                            animationSpeed = 0.15;
                            targetColors = {
                                c1: randomColor(),
                                c2: randomColor(),
                                c3: randomColor()
                            };
                        } else {
                            targetAmplitude = 0;
                            targetRadius = baseRadius;
                            animationSpeed = 0.08;
                        }
                    },
                    onError: (error) => {
                        log(`Error: ${error.message}`, 'error');
                        isConnected = false;
                        document.getElementById('startButton').disabled = false;
                        document.getElementById('stopButton').disabled = true;
                    },
                    onModeChange: (mode) => {
                        log(`Mode changed to: ${mode}`);
                        if (mode === 'speaking') {
                            targetAmplitude = 1;
                            targetRotationX = p.PI * 0.1;
                            targetRadius = maxRadius;
                            animationSpeed = 0.15;
                            targetColors = {
                                c1: randomColor(),
                                c2: randomColor(),
                                c3: randomColor()
                            };
                        } else {
                            targetAmplitude = 0;
                            targetRotationX = 0;
                            targetRadius = baseRadius;
                            animationSpeed = 0.08;
                        }
                    },
                    onStatusChange: (status) => {
                        log(`Status changed to: ${status}`);
                    }
                }
            });

            await conversation.connect();
            isConnected = true;
            log('Connected to agent');
        }
    } catch (error) {
        log(`Failed to connect: ${error.message}`, 'error');
        document.getElementById('startButton').disabled = false;
        document.getElementById('stopButton').disabled = true;
    }
}

// End conversation
async function stopConversation() {
    if (conversation) {
        try {
            log('Ending conversation...');
            await conversation.endSession();
            conversation = null;
            targetAmplitude = 0;
            targetRadius = baseRadius;
            animationSpeed = 0.08;
            targetColors = {
                c1: [255, 140, 0],
                c2: [255, 0, 128],
                c3: [0, 191, 255]
            };
            log('Conversation ended successfully');
        } catch (error) {
            log(`Error ending conversation: ${error.message}`, 'error');
        }
    }
}

// Event listeners
document.getElementById('startButton').addEventListener('click', startConversation);
document.getElementById('stopButton').addEventListener('click', stopConversation);

// Initial setup
document.getElementById('stopButton').disabled = true;
