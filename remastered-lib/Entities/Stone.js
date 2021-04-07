import Entity from './Entity.js';
import constants from '../../shared/constants.js';
class Stone extends Entity {
    constructor(game) {
        let getGoodPosition = () => {
            let pos = {
                x: 90 + Math.floor(Math.random() * (constants.MAP.WIDTH - 180)),
                y: 90 + Math.floor(Math.random() * (constants.MAP.HEIGHT - 180)),
            };
            if (
                game.qtree.circleCircleCollisions({
                    position: pos,
                    radius: 90,
                }).length !== 0
            )
                return getGoodPosition();
            else return pos;
        };
        super(getGoodPosition(), 50, game);
        this.isStatic = true;
        this.radius = 90;
        this.is = constants.STONE.TYPE;
        const Stones = game.Stones;
        for (let i = 0; i < constants.STONE.LIMIT; i++) {
            if (!Stones[i]) {
                Stones[i] = this;
                this.id = i;
                break;
            }
        }
        game.StoneCount++;
        game.qtree.insert(this);
    }
}
export default Stone;
