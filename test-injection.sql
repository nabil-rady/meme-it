BEGIN;

-- Drake meme
INSERT INTO `Memes` (`url`) VALUES ('/drake.jpg');

INSERT INTO `CaptionDetails` 
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`, `color`) 
VALUES 
(1, 380, 36, 0, 250, 30, 6, '#000');

INSERT INTO `CaptionDetails` 
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`, `color`) 
VALUES 
(1, 380, 285, 0, 250, 30, 6, '#000');

-- Spongebob meme
INSERT INTO `Memes` (`url`) VALUES ('/sponge.jpg');

INSERT INTO `CaptionDetails` 
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`, `color`) 
VALUES 
(2, 250, 50, 0, 500, 35, 2, '#000');

INSERT INTO `CaptionDetails` 
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`, `color`) 
VALUES 
(2, 335, 224, 22, 175, 22, 2, '#000');

-- Tux Winnie meme
INSERT INTO `Memes` (`url`) VALUES ('/tux-winnie.png');

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`, `color`)
VALUES
(3, 360, 36, 0, 250, 30, 7, '#000');

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`, `color`)
VALUES
(3, 360, 285, 0, 250, 30, 7, '#000');

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
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`, `color`)
VALUES
(5, 125, 36, 0, 250, 30, 7, '#000');

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`, `color`)
VALUES
(5, 125, 285, 0, 250, 30, 7, '#000');

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
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`, `color`)
VALUES
(7, 360, 36, 0, 225, 30, 7, '#000');

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`, `color`)
VALUES
(7, 380, 330, 0, 215, 30, 5, '#000');

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

-- Daboor gas meme
INSERT INTO `Memes` (`url`) VALUES ('/daboor-gas.jpg');

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(9, 225, 210, 0, 450, 30, 2);

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(9, 225, 450, 0, 450, 30, 2);

-- Osra m3 b3deena meme
INSERT INTO `Memes` (`url`) VALUES ('/osra-m3-b3deena.jpg');

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(10, 225, 210, 0, 450, 30, 2);

INSERT INTO `CaptionDetails`
(`memeId`, `positionX`, `positionY`, `rotation`, `width`, `initialFontSize`, `maxNumberOfLines`)
VALUES
(10, 225, 450, 0, 450, 30, 2);

COMMIT;
