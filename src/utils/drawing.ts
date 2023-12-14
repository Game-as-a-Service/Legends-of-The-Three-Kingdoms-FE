export const atkLine = ({
    startPoint = new Phaser.Math.Vector2(400, 515),
    endPoint = new Phaser.Math.Vector2(150, 120),
    scene,
}: {
    startPoint?: Phaser.Math.Vector2
    endPoint?: Phaser.Math.Vector2
    scene: Phaser.Scene
}): void => {
    const graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xffbf00 } })
    graphics.setDepth(200)

    // Tween 动画，让线在两秒内从 A 到 B
    scene.tweens.add({
        targets: { t: 0 }, // 使用对象作为目标，因为 tween 总是在目标对象上进行操作
        t: 1,
        ease: 'Linear',
        duration: 400,
        onUpdate: function (tween) {
            const t = tween.getValue() // 获取插值值
            graphics.clear() // 清除先前的绘制
            drawLine(graphics, startPoint, endPoint, t)
        },
        onComplete: function () {
            scene.tweens.add({
                targets: { t: 1 }, // 使用对象作为目标，因为 tween 总是在目标对象上进行操作
                t: 0,
                ease: 'Linear',
                duration: 400,
                onUpdate: function (tween) {
                    const t = tween.getValue() // 获取插值值
                    graphics.clear() // 清除先前的绘制
                    drawLine(graphics, endPoint, startPoint, t)
                },
                onComplete: function () {
                    graphics.clear()
                },
            })
        },
    })
}
const drawLine = (
    graphics: Phaser.GameObjects.Graphics,
    startPoint: Phaser.Math.Vector2,
    endPoint: Phaser.Math.Vector2,
    t = 0,
): void => {
    const line = new Phaser.Geom.Line(
        startPoint.x,
        startPoint.y,
        Phaser.Math.Linear(startPoint.x, endPoint.x, t),
        Phaser.Math.Linear(startPoint.y, endPoint.y, t),
    )
    graphics.strokeLineShape(line)
}
