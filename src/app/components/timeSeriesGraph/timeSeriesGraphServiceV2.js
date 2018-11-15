app.service('timeSeriesGraphServiceV2', ['$log', '$state', '$filter', 'timeSeriesAnnotationService', 'timeSeriesTrendService', 'annotationPreviewService', 'annotationsService', function ($log, $state, $filter, timeSeriesAnnotationService, timeSeriesTrendService, annotationPreviewService, annotationsService) {

    var self = this;

    var data;

    var annotationInEdit;

    var activeRunId, activeColumn;

    var activeTrend;

    var margin, width, height;

    var offsetLine;

    var x, y, z;

    var xAxis, yAxis;

    var offsetVector, currentVector;

    var zoom;

    var svg, graph;

    var annotations, annotationControls

    var xLock, yLock;

    var trendLineColours = ['#8cc2d0', '#152e34'];

    var options;

    var user;

    var annotationGroupObject;



    self.graphInit = function (graphData, graphOptions) {
        console.log(graphData)
        ctrlDown = false;
        user = true;
        data = graphData;
        options = graphOptions;




        options.width = options.hasOwnProperty('width') ? options.width : 1300;
        options.height = options.hasOwnProperty('height') ? options.height : 600;
        options.urlState = options.hasOwnProperty('urlState') ? options.urlState : false;
        options.axisLock = options.hasOwnProperty('axisLock') ? options.axisLock : true;
        options.annotation = options.hasOwnProperty('annotation') ? options.annotation : false;

        margin = options.hasOwnProperty('margin') ? options.margin : {
            top: 110,
            right: 170,
            bottom: 70,
            left: 160
        }

        width = options.width - margin.left - margin.right;
        height = options.height - margin.top - margin.bottom;

        x = d3.scaleLinear().range([0, width]);
        y = d3.scaleLinear().range([height, 0]);

        xAxis = d3.axisBottom(x);
        yAxis = d3.axisLeft(y);

        offsetVector = d3.zoomIdentity.scale(1).translate(0, 0);
        currentVector = d3.zoomIdentity.scale(1).translate(0, 0);

        svg = d3.select('.graph-container')
            .attr("width", options.width)
            .attr("height", options.height)
            .attr("viewBox", "0 0 " + options.width + ' ' + options.height)
            .attr("preserveAspectRatio", "xMinYMax meet");

        graph = svg
            .append("g")
            .attr('class', 'graph')
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        zoom = d3.zoom()
            .on('zoom', zoomed);

        svg.call(zoom)
            .on("dblclick.zoom", null);

        d3.select('body')
            .on('keydown', function () {
                $log.log(d3.event.keyCode);
                if (d3.event.keyCode === 16) {
                    ctrlDown = true;
                }
            });

        d3.select('body')
            .on('keyup', function () {
                if (d3.event.keyCode === 16) {
                    ctrlDown = false;
                }
            });

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);



        offsetLine = new OffsetLine(graph, 0, 0, 420, 970);



        graph.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        graph.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis)

        graph.append('g')
            .attr('class', 'run-group')


        if (options.axisLock) {
            axisLockInitialize();
        }

        if (options.annotation) {
            annotationInitialize();
        }


    }

    function axisLockInitialize() {
        yLock = new Lock('y-lock', svg, 30, 30, (margin.left * 0.85), (margin.top * 0.6));
        xLock = new Lock('x-lock', svg, 30, 30, (width + margin.left * 1.2), (height + margin.top * 0.8));
    }

    function annotationInitialize() {
        /*annotationGroup = graph.append('g').attr('class', 'annotation-group');
        annotationControls = graph.append('g').attr('class', 'annoation-control-group');

        annotationAdd = svg.append('g')
            .attr('transform', 'translate(' + (width + margin.left * 1.2) + ',' + (margin.top * 0.8) + ')')
            .attr('class', 'annotation-add');

        annotationAdd.append('svg:image')
            .attr('xlink:href', './assets/img/add.svg')
            .attr('width', '30')
            .attr('height', '30')
            .on('click', function () {
                var xt = currentVector.rescaleX(x);
                annotationAddNew(undefined, xt.invert(500), '');
            });*/

        annotationGroupObject = new AnnotationGroup(graph);
    }

    function calculateXDomain(scale, data) {
        scale.domain([
            d3.min(data, function (d) {
                return d.x;
            }),
            d3.max(data, function (d) {
                return d.x;
            })
        ])
    }

    function calculateYDomain(scale, data) {
        scale.domain([
            d3.min(data, function (d) {
                return d.y;
            }),
            d3.max(data, function (d) {
                return d.y;
            })
        ])
    }

    //renders all annotations 
    function annotationRender(annotations) {
        var xt = currentVector.rescaleX(x);

        var makeAnnotations = d3.annotation()
            .notePadding(15)
            .type(d3.annotationBadge)
            .accessors({
                x: d => xt(d.Time),
                y: d => -10

            })
            .annotations(annotations)
            .on('subjectclick', annotationClick)
        annotationGroup.call(makeAnnotations);
    }

    //renders annotation edit controls


    function annotationControlsRender(t) {
        var xt = currentVector.rescaleX(x);

        var annotationInEditId = annotationControls.select('g').attr('id');
        annotationControls.selectAll('g')
            .each(function (d) {
                var image = d3.select(this).select('image');
                var imageWidth = image.attr('width');
                //TAKE A LOOK CAN I USE ANNOTATION IN EDIT INSTEAD
                var annotationInEdit = timeSeriesAnnotationService.getAnnotation(activeRunId, annotationInEditId);
                var x = xt(annotationBadge.data.Time);
                image.attr('x', (x - (imageWidth / 2)));
            })
    }

    //drags annotation in edit
    function annotationInEditDrag() {
        annotationControls.selectAll('g')
            .each(function (d) {
                var image = d3.select(this).select('image');
                var imageWidth = image.attr('width');
                image.att('x', (d3.event.x - (imageWidth / 2)));
            })

        var xt = currentVector.rescaleX(x);
        var time = xt.invert(d3.event.x);
        annotationInEdit.data.Time = time;
        annotationRender([annotationInEdit], currentVector);
    }

    function annotationClick(annotation) {
        annotationInEdit = annotation;
        showAnnotation(annotation);
    }

    //extract trend line data
    function extractTrendLineData(runId, columnY) {
        var runData = [];

        for (var i = 0; i < data.length; i++) {
            if (data[i].id === runId) {

                runData = (data[i].values);
            }
        }

        for (var i = 0; i < runData.length; i++) {
            runData[i] = {
                x: runData[i]['Time'],
                y: runData[i][columnY]
            }
        }

        console.log(runData);
        return runData;
    }

    //add trend line
    self.addTrend = function (runId, columnY) {

        var trendData = extractTrendLineData(runId, columnY);

        var trend = timeSeriesTrendService.addTrend(runId, columnY, d3.scaleLinear(), d3.scaleLinear(), 'Time', columnY, trendData);

        trend.scaleY.range([height, 0]);
        calculateYDomain(trend.scaleY, trend.data);
        calculateXDomain(x, trend.data);


        var activeTrendArray = activeTrend.split('+');

        if (runId == activeTrendArray[0] && columnY == activeTrendArray[1]) {

            offsetLine.xcoor = trend.data[0].x;
            offsetLine.ycoor = trend.data[0].y;
        }

        var transition = d3.transition().duration(750).ease(d3.easeLinear);
        graph.select('.axis--x').transition(transition).call(xAxis.scale(x));
        graph.select('.axis--y').transition(transition).call(yAxis.scale(trend.scaleY));

        var run = graph.select('.run-group')
            .selectAll('run')
            .data([trend])
            .enter().append('g')
            .attr('class', function (d) {
                var id = $filter('componentIdClassFilter')(d.id);
                var columnName = $filter('componentIdClassFilter')(d.yLabel);
                return 'run ' + id + ' ' + columnName;
            });

        var trendLength = (timeSeriesTrendService.getTrends().length - 1) % trendLineColours.length;
        var trendColour = trendLineColours[trendLength];

        //IS COLUMN NEEDED
        run.append('path')
            .attr('class', 'line')
            .attr('column', function (trend) {
                return trend.yLabel;
            })
            .attr('d', function (trend) {
                var line = d3.line()
                    .x(function (d) { return x(d.x); })
                    .y(function (d) { return trend.scaleY(d.y); })
                return line(trend.data)
            })
            .style('stroke', trendColour)

        svg.call(zoom).transition()
            .call(zoom.transform, d3.zoomIdentity
                .scale(1)
                .translate(0, 0)
            )
    }

    //remove trend
    self.removeTrend = function (id, columnName) {
        timeSeriesTrendService.removeTrend(id, columnName);

        var activeTrend = activeTrend.split('+');

        if (id == activeTrend[0] && columnName == activeTrend[1]) {


        }

        var id = $filter('componentIdClassFilter')(id);
        var columnName = $filter('componentIdClassFilter')(columnName);
        graph.select('.run-group').select('.' + id + '.' + columnName).remove();
    }

    //transition graph
    self.transition = function (transitionVector, offsetVector) {

        if (transitionVector) {
            svg.call(zoom).transition()
                .duration(1500)
                .call(zoom.transform, d3.zoomIdentity
                    .translate(transitionVector.x, transitionVector.y)
                    .scale(transitionVector.k)
                ).on('end', function () {
                    user = false;

                    var xO = transitionVector.x + offsetVector.x;
                    var yO = transitionVector.y + offsetVector.y;

                    svg.call(zoom).transition()
                        .duration(1500)
                        .call(zoom.transform, d3.zoomIdentity
                            .translate(xO, yO)
                            .scale(transitionVector.k)
                        ).on('end', function () {
                            user = true;
                        }).on('interrupt', function () {
                            user = true;
                        })
                });
        }

    }

    //when graph zooms
    function zoomed() {


        var t = d3.event.transform;

        t.k = parseFloat((t.k).toFixed(2));
        t.x = parseFloat((t.x).toFixed(2));
        t.y = parseFloat((t.y).toFixed(2));

        var isZooming = currentVector.k != t.k;

        if (options.axisLock) {
            t.x = xLock.locked() && !isZooming ? currentVector.x : t.x;
            t.y = yLock.locked() && !isZooming ? currentVector.y : t.y;
        }





        if (ctrlDown || !user) {
            offsetting(t);
        } else {
            panning(t);
        }

        if (annotationInEdit != undefined) {
            annotationRender([annotationInEdit]);
            annotationControlsRender(t);
        } else {
            var active = activeTrend.split('+')
            //annotationRender(timeSeriesAnnotationService.getAnnotations(active[0]));
            annotationGroupObject.render(timeSeriesAnnotationService.getAnnotations(active[0]), x, offsetVector);
        }


    }


    function panning(t) {

        var xt = t.rescaleX(x);
        var yt;
        graph.select('.axis--x').call(xAxis.scale(xt));

        graph.selectAll('.line')
            .attr('d', function (trend) {

                yt = t.rescaleY(trend.scaleY);

                graph.select('.axis--y').call(yAxis.scale(yt));

                offsetLine.renderWhenPanning(xt, yt);
                var line = d3.line()
                    .x(function (d) { return xt(d.x); })
                    .y(function (d) { return yt(d.y); })


                return line(trend.data)


            });
        currentVector = t;
        offsetVector = t;

        $state.go('.', {
            viewVector: JSON.stringify(t),
            offsetVector: JSON.stringify({ x: 0, y: 0 })
        })

    }

    //offsetting trend
    function offsetting(t) {
        var xt = t.rescaleX(x);

        var activeTrendArray = activeTrend.split('+');

        var line = graph.select('.run-group').select('.' + $filter('componentIdClassFilter')(activeTrendArray[0]) + '.' + $filter('componentIdClassFilter')(activeTrendArray[1])).selectAll('.line');
        var yt;

        if (!line.empty()) {

            line.attr('d', function (trend) {
                yt = t.rescaleY(trend.scaleY);
                var line = d3.line()
                    .x(function (d) { return xt(d.x) })
                    .y(function (d) { return yt(d.y) })

                return line(trend.data);
            })

            var xDiffrence = t.x - currentVector.x;
            var yDiffrence = t.y - currentVector.y;

            offsetVector = t;

            $state.go('.', {
                offsetVector: JSON.stringify({ x: xDiffrence, y: yDiffrence })
            })
            offsetLine.renderWhenOffsetting(xt, yt);
        }
    }

    function showAnnotation() {

        /*annotationPreviewService.showAnnotationPreviewPanel(annotationInEdit)
            .then(function (result) {
                annotationClickEdit(result);
                annotationBadgeRender([annotationInEdit]);
            }).catch(function () {
                annotationInEdit = undefined;

                annotationBadgeRender(timeSeriesAnnotationService.getAnnotations(activeRunId));
            });*/

    }




    function OffsetLine(parentNode, xcoor = 0, ycoor = 0, boundyHeight, boundryWidth, colour = '255,0,0', width = '2') {
        this.node = parentNode.append('g').attr('class', 'offset-line').append('line');
        this.xcoor = xcoor,
            this.ycoor = ycoor,
            this.colour = colour,
            this.width = width,
            this.boundryHeight = boundyHeight;
        this.boundryWidth = boundryWidth;
        this.renderWhenOffsetting = function (xScaler, yScaler) {
            var xPoint = xScaler(this.xcoor);
            var yPoint = yScaler(this.ycoor);

            if (yPoint > this.boundryHeight) {
                yPoint = this.boundryHeight;
            } else if (yPoint < 0) {
                yPoint = 0;
            }

            if (xPoint > this.boundryWidth) {
                xPoint = this.boundryWidth;
            } else if (xPoint < 0) {
                xPoint = 0;
            }

            this.node.attr('x2', xPoint)
                .attr('y2', yPoint);
            this.node.style('stroke', 'rgb(255,0,0)')
                .style('stroke-width', '2');
        }
        this.renderWhenPanning = function (xScaler, yScaler) {

            var xPoint = xScaler(this.xcoor);
            var yPoint = yScaler(this.ycoor);

            if (yPoint > this.boundryHeight) {
                yPoint = this.boundryHeight;
            } else if (yPoint < 0) {
                yPoint = 0;
            }

            if (xPoint > this.boundryWidth) {
                xPoint = this.boundryWidth;
            } else if (xPoint < 0) {
                xPoint = 0;
            }

            this.node.attr('x1', xPoint)
                .attr('y1', yPoint)
                .attr('x2', xPoint)
                .attr('y2', yPoint);
            this.node.style('stroke', 'rgb(255,0,0)')
                .style('stroke-width', '2');
        }
    }

    function Lock(axisLabel, parentNode, lockWidth, lockHeight, transX, transY) {
        this.lockWidth = lockWidth;
        this.lockHeight = lockHeight;
        this.transX = transX;
        this.transY = transY;
        this.axisLabel = axisLabel;
        this.lockToggle = function () {
            console.log(this.locked);
            var lock = parentNode.select('.' + axisLabel);
            var image = lock.select('image');
            var locked = (lock.attr('locked') == 1)
            locked ? image.attr('xlink:href', './assets/img/lock_unlocked.svg') : image.attr('xlink:href', './assets/img/lock_locked.svg')
            locked ? locked = 0 : locked = 1;
            lock.attr('locked', locked);
        }
        this.node = parentNode.append('g').attr('transform', 'translate(' + transX + ',' + transY + ')').attr('class', axisLabel).append('svg:image')
            .attr('xlink:href', './assets/img/lock_unlocked.svg')
            .attr('width', lockWidth)
            .attr('height', lockHeight)
            .attr('locked', 0)
            .on('click', this.lockToggle)
        this.locked = function () {
            var lock = parentNode.select('.' + axisLabel);
            var locked = (lock.attr('locked') == 1);
            return locked;
        }

    }

    function AnnotationGroup(parentNode) {
        this.group = parentNode.append('g').attr('class', 'annotation-group');
        this.controls = parentNode.append('g').attr('class', 'annotation-control-group');
        this.annotationInEdit = null;
        this.annotationClick1 = function (group, annotation, axis, vector) {
            
            annotation = timeSeriesAnnotationService.getAnnotation(annotation.data.groupId, annotation.id);
            group.annotationInEdit = annotation;
            
            annotation.click(group.controls,axis,vector);
        }
        this.render = function (annotations, axis, vector) {
            if (this.annotationInEdit) {
                this.annotationInEdit.annotationLabelRender(this.group, this.controls, axis, vector);
                annotations = [this.annotationInEdit];
            }
            var annotationGroup = (this);
            var xScaler = vector.rescaleX(axis);
            var makeAnnotations = d3.annotation()
                .notePadding(15)
                .type(d3.annotationBadge)
                .accessors({
                    x: d => xScaler(d.Time),
                    y: d => -10
                })
                .annotations(annotations)
                .on('subjectclick', function (annotation) {
                    if (!annotationGroup.annotationInEdit) {
                        annotationGroup.annotationClick1(annotationGroup, annotation, axis, vector);
                    }
                });
            this.group.call(makeAnnotations);
        }
    }






    //needs looking at ASAP

    self.getActiveColumn = function () {
        return activeColumn;
    }

    self.getActiveRun = function () {
        return activeRunId;
    }

    self.setActiveColumn = function (column) {
        activeTrend = column;
    }

    self.setActiveRun = function (runId) {
        //activeRunId = runId;

    }





}])