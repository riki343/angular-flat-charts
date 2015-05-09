/**
 * Title: Angular Flat Charts
 * Author: Vladislav Kokso (riki34)
 * VK: http://vk.com/riki34
 * Skype: vladislav.kosko
 */

var angularFlowCharts = angular.module('angularFlatCharts', []);

angularFlowCharts.directive('flatChart', function () {
        return {
            'restrict': 'AE',
            'scope': { chartData: '=' },
            'template':
                '<canvas class="flat-chart-canvas"></canvas>',
            'link': function ($scope, $element, $attrs) {

                var color = (angular.isDefined($attrs.color)) ? $attrs.color : 'white';
                var offsetPercent = 10;
                var height = parseInt($attrs.height);
                var width = parseInt($attrs.width);
                var offsetX = Math.round(((width * offsetPercent) / 100) / 2);
                var offsetY = Math.round(((height * offsetPercent) / 100) / 2);
                width -= offsetX * 2; height -= offsetY * 2;
                var canvas = $element.find('canvas')[0];

                function MaxCoords(data) {
                    var Ymax = 0, Xmax = 0;
                    for (var i = 1; i < data.length; i++) {
                        if (data[i].y > data[Ymax].y) {
                            Ymax = i;
                        }
                        if (data[i].x > data[Xmax].x) {
                            Xmax = i;
                        }
                    }
                    return { 'x': Xmax, 'y': Ymax };
                }

                function ConvertToRelativeCoordinates(data) {
                    var maxCoords = MaxCoords(data);
                    maxCoords.Ymax = data[maxCoords.y].y;
                    maxCoords.Xmax = data[maxCoords.x].x;

                    if (!isNaN(height) && !isNaN(width)) {
                        for (var i = 0; i < data.length; i++) {
                            data[i].relY = offsetY + (height - Math.round((data[i].y * height) / maxCoords.Ymax));
                            data[i].relX = Math.round((data[i].x * width) / maxCoords.Xmax);
                        }
                    }
                    return data;
                }

                function DrawChart(canvas, data, mouseon) {
                    var widthOnePercent = width / 100;
                    var canvasCtx = canvas.getContext('2d');
                    canvasCtx.beginPath();
                    canvasCtx.moveTo(data[0].relX, data[0].relY);
                    canvasCtx.strokeStyle = color;
                    for (var i = 1; i < data.length; i++) {
                        canvasCtx.lineTo(data[i].relX, data[i].relY);
                    }
                    canvasCtx.stroke();

                    // Draw filled circle around the point with radius 0.6% of width
                    if (mouseon) {
                        for (i = 0; i < data.length; i++) {
                            canvasCtx.beginPath();
                            canvasCtx.arc(data[i].relX, data[i].relY, widthOnePercent * 0.6, 0, 2 * Math.PI, false);
                            canvasCtx.fillStyle = color;
                            canvasCtx.fill();
                            canvasCtx.strokeStyle = color;
                            canvasCtx.stroke();
                        }
                    }
                }

                function getMouseCoords(canvas, $event) {
                    var rect = canvas.getBoundingClientRect();
                    return {
                        x: Math.round(($event.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
                        y: Math.round(($event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
                    };
                }

                function checkPointInArray(data, x) {
                    var widthOnePercent = width / 100;
                    var finded = null;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].relX - (widthOnePercent * 2) < x && data[i].relX + (widthOnePercent * 2) > x) {
                            finded = data[i]; break;
                        }
                    }
                    return finded;
                }

                function drawVerticalLine(canvas, x) {
                    var canvasCtx = canvas.getContext('2d');
                    canvasCtx.beginPath();
                    canvasCtx.moveTo(x, offsetY);
                    canvasCtx.strokeStyle = color;
                    canvasCtx.lineTo(x, height + offsetY);
                    canvasCtx.stroke();
                }

                function detectPointPosition(point) {
                    var widthOnePercent = width / 100;
                    var halfWidth = width / 2;
                    var heightOnePercent = height / 100;
                    var halfHeight = height / 2;

                    // Detect point position to draw tooltip
                    var rectCoords = {
                        'x': 0, 'y': 0, 'offsetX': 0,
                        'offsetY': 0, 'textX': 0, 'textY': 0
                    };

                    if (point.relX <= halfWidth + offsetX && point.relY <= halfHeight + offsetY) {
                        rectCoords.x = point.relX + (widthOnePercent * 2);
                        rectCoords.y = point.relY + (heightOnePercent * 2);
                        rectCoords.offsetX = widthOnePercent * 7;
                        rectCoords.offsetY = heightOnePercent * 10;
                    } else if (point.relX > halfWidth + offsetX && point.relY <= halfHeight + offsetY) {
                        rectCoords.x = point.relX - (widthOnePercent * 2);
                        rectCoords.y = point.relY + (heightOnePercent * 2);
                        rectCoords.offsetX = -widthOnePercent * 7;
                        rectCoords.offsetY = heightOnePercent * 10;
                    } else if (point.relX <= halfWidth + offsetX && point.relY > halfHeight + offsetY) {
                        rectCoords.x = point.relX + (widthOnePercent * 2);
                        rectCoords.y = point.relY - (heightOnePercent * 2);
                        rectCoords.offsetX = widthOnePercent * 7;
                        rectCoords.offsetY = -heightOnePercent * 10;
                    } else if (point.relX > halfWidth + offsetX && point.relY > halfHeight + offsetY) {
                        rectCoords.x = point.relX - (widthOnePercent * 2);
                        rectCoords.y = point.relY - (heightOnePercent * 2);
                        rectCoords.offsetX = -widthOnePercent * 7;
                        rectCoords.offsetY = -heightOnePercent * 10;
                    }

                    rectCoords.textX = rectCoords.x + (rectCoords.offsetX / 2);
                    rectCoords.textY = rectCoords.y + (rectCoords.offsetY / 2);

                    return rectCoords;
                }

                function drawPointInfo(canvas, finded, mousePosition) {
                    var canvasCtx = canvas.getContext('2d');
                    var widthOnePercent = width / 100;
                    var heightOnePercent = height / 100;

                    // Draw stroke circle around the point with radius 2% of width
                    canvasCtx.beginPath();
                    canvasCtx.arc(finded.relX, finded.relY, widthOnePercent * 2, 0, 2 * Math.PI, false);
                    canvasCtx.strokeStyle = color;
                    canvasCtx.stroke();

                    // Draw tooltip near point
                    canvasCtx.beginPath();
                    var rectCoords = detectPointPosition(finded);
                    canvasCtx.rect(rectCoords.x, rectCoords.y, rectCoords.offsetX, rectCoords.offsetY);
                    canvasCtx.globalAlpha = 0.3;
                    canvasCtx.fillStyle = color;
                    canvasCtx.fill();
                    canvasCtx.stroke();
                    canvasCtx.globalAlpha = 1.0;

                    // Draw text in tooltip
                    canvasCtx.strokeText(finded.y, rectCoords.textX, rectCoords.textY);
                }

                canvas.width = parseInt($attrs.width);
                canvas.height = parseInt($attrs.height);
                var data = ConvertToRelativeCoordinates($scope.chartData);
                DrawChart(canvas, data, false);

                canvas.addEventListener('mousemove', function ($event) {
                    var mousePosition = getMouseCoords(canvas, $event);
                    var canvasCtx = canvas.getContext('2d');
                    var widthOnePercent = width / 100;

                    // Clearing of canvas
                    canvasCtx.clearRect(0, 0, width + (offsetX * 2), height + (offsetY * 2));

                    // Drawing chart
                    DrawChart(canvas, data, true);

                    // Drawing of point and tooltip if we are in the same position as the point of axis X
                    var finded = checkPointInArray(data, mousePosition.x);
                    if (finded) {
                        drawPointInfo(canvas, finded, mousePosition);
                    }

                    // Drawing of vertical line that indicates current position of axis X
                    if (mousePosition.x > offsetX - (widthOnePercent * 2)
                        && mousePosition.x < width + (widthOnePercent * 2)) {
                        drawVerticalLine(canvas, mousePosition.x);
                    }
                });

                canvas.addEventListener('mouseleave', function ($event) {
                    var canvasCtx = canvas.getContext('2d');
                    canvasCtx.clearRect(0, 0, width + (offsetX * 2), height + (offsetY * 2));
                    DrawChart(canvas, data, false);
                });
            }
        }
    }
);