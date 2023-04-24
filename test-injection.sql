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

-- Say my name meme
INSERT INTO `Memes` (`url`) VALUES ('/say-my-name.jpg');

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(4, 110, 50, 0, 200, 30, 4);

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(4, 380, 200, 0, 250, 30, 4);

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(4, 110, 360, 0, 200, 30, 3);

-- Mr Incredible uncanny meme
INSERT INTO `Memes` (`url`) VALUES ('/mr-incredible-uncanny.jpg');

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(5, 125, 36, 0, 250, 30, 7);

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(5, 125, 285, 0, 250, 30, 7);

-- Saba7 el 5er meme
INSERT INTO `Memes` (`url`) VALUES ('/saba7-el-5er.jpg');

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(6, 225, 200, 0, 450, 30, 2);

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(6, 225, 450, 0, 450, 30, 2);

-- Japanese Ramadan meme
INSERT INTO `Memes` (`url`) VALUES ('/japanese-ramadan.png');

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(7, 360, 36, 0, 225, 30, 7);

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(7, 380, 330, 0, 215, 30, 5);

-- Sleeping henedi meme
INSERT INTO `Memes` (`url`) VALUES ('/sleeping-henedi.jpg');

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(8, 225, 210, 0, 450, 25, 2);

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(8, 225, 450, 0, 450, 25, 2);

COMMIT;
