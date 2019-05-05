/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50711
Source Host           : localhost:3306
Source Database       : test

Target Server Type    : MYSQL
Target Server Version : 50711
File Encoding         : 65001

Date: 2019-05-05 16:06:03
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `t_user`
-- ----------------------------
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user` (
  `Fid` int(11) NOT NULL AUTO_INCREMENT,
  `Fname` varchar(64) DEFAULT NULL,
  `Fnick_name` varchar(64) DEFAULT NULL,
  `Fcreate_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Fid`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_user
-- ----------------------------
INSERT INTO `t_user` VALUES ('1', 'my name', 'my', '2019-05-05 10:47:14');
INSERT INTO `t_user` VALUES ('2', 'my name', 'my', '2019-05-05 10:57:36');
INSERT INTO `t_user` VALUES ('3', 'my name', 'my', '2019-05-05 10:59:03');
INSERT INTO `t_user` VALUES ('4', 'my name', 'my', '2019-05-05 10:59:38');
INSERT INTO `t_user` VALUES ('5', 'my name', 'my', '2019-05-05 11:12:24');
INSERT INTO `t_user` VALUES ('6', 'my name', 'my', '2019-05-05 11:12:35');
INSERT INTO `t_user` VALUES ('7', 'my name', 'my', '2019-05-05 12:11:45');
INSERT INTO `t_user` VALUES ('8', 'my name', 'my', '2019-05-05 12:12:14');