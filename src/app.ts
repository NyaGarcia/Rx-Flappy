import { GameService } from './services/game.service';
import { MainController } from './controllers/main.controller';

const view = window.document;
const mainController = new MainController(view, new GameService());

mainController.startGame();
