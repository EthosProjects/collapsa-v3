import Entity from './Entity.js';
import constants from '../../shared/constants.js';
class Tree extends Entity {
    /**
     *
     * @param {Game} game
     */
    constructor(game) {
        let getGoodPosition = () => {
            let pos = {
                x: 110 + Math.floor(Math.random() * (constants.MAP.WIDTH - 220)),
                y: 110 + Math.floor(Math.random() * (constants.MAP.HEIGHT - 220)),
            };
            if (
                game.qtree.circleCircleCollisions({
                    position: pos,
                    radius: 110 * (35 / 99),
                }).length !== 0
            )
                return getGoodPosition();
            else return pos;
        };
        super(getGoodPosition(), 50, game);
        this.isStatic = true;
        this.radius = 110 * (35 / 99);
        this.is = constants.TREE.TYPE;
        const Trees = game.Trees;
        for (let i = 0; i < constants.TREE.LIMIT; i++) {
            //console.log('Checking', i, constants.TREE.LIMIT, Trees.map(t => t ? t.id : null))
            if (!Trees[i]) {
                Trees[i] = this;
                this.id = i;
                break;
            }
        }
        game.TreeCount++;
        game.qtree.insert(this);
    }
}
export default Tree;
