BEGIN;

-- Drake meme
INSERT INTO `Memes` (`url`) VALUES ('/drake.jpg');

INSERT INTO `CaptionDetails` 
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`) 
VALUES 
(1, 380, 36, 0, 250, 30, 6);

INSERT INTO `CaptionDetails` 
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`) 
VALUES 
(1, 380, 285, 0, 250, 30, 6);

-- Spongebob meme
INSERT INTO `Memes` (`url`) VALUES ('/sponge.jpg');

INSERT INTO `CaptionDetails` 
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`) 
VALUES 
(2, 250, 50, 0, 500, 35, 2);

INSERT INTO `CaptionDetails` 
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`) 
VALUES 
(2, 335, 224, 22, 175, 22, 2);

-- Tux Winnie meme
INSERT INTO `Memes` (`url`) VALUES ('/tux-winnie.png');

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(3, 360, 36, 0, 250, 30, 7);

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(3, 360, 285, 0, 250, 30, 7);

COMMIT;
