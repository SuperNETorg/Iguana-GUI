var gulp = require('gulp'),
    rimraf = require('gulp-rimraf'),
    pathsExports = require('../gulp-tasks/paths.js');

paths = pathsExports.getPaths();

exports.cleanCSS = function(buildMode) {
  return gulp
         .src(paths.build[buildMode] + '/css/*', {
           read: false
         })
         .pipe(rimraf());
}

exports.cleanJS = function(buildMode) {
  return gulp
         .src(paths.build[buildMode] + '/js/*', {
           read: false
         })
         .pipe(rimraf());
}

exports.cleanFonts = function(buildMode) {
  return gulp
         .src(paths.build[buildMode] + '/fonts/*', {
           read: false
         })
         .pipe(rimraf());
}

exports.cleanIndex = function(buildMode) {
  return gulp
         .src(paths.build[buildMode] + '/index.html', {
           read: false
         })
         .pipe(rimraf());
}

exports.cleanAllProd = function(buildMode) {
  return gulp
         .src(paths.build[buildMode], {
           read: false
         })
         .pipe(rimraf());
}

exports.cleanProdOnEnd = function(buildMode) {
  return gulp
         .src([
            paths.build[buildMode] + '/css',
            paths.build[buildMode] + '/js',
         ], {
           read: false
         })
         .pipe(rimraf());
}

exports.cleanProdCompact = function(buildMode) {
  return gulp
         .src([
                paths.build[buildMode] + '/css',
                paths.build[buildMode] + '/all.js',
                paths.build[buildMode] + '/style.css'
              ],{
                read: false
         })
         .pipe(rimraf());
}

exports.cleanAllDev = function(buildMode) {
  return gulp
         .src(paths.build[buildMode], {
           read: false
         })
         .pipe(rimraf());
}