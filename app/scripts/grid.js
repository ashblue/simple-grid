(function ($) {
    $.fn.grid = function (options) {
        var defaults = {
            tileSize: 120,
            cols: 3,
            rows: 3,
            margin: 10,
            data: [],
            modelClass: '.grid-model'
        };

        var _dragTarget;

        var _event = {
            listDrop: function (e) {
                var $el = $(_dragTarget);
                var offset = $(this).offset();
                var coord = {
                    x: e.originalEvent.pageX - offset.left,
                    y: e.originalEvent.pageY - offset.top
                };

                var oldPos = {
                    x: parseInt($(_dragTarget).attr('data-x'), 10),
                    y: parseInt($(_dragTarget).attr('data-y'), 10)
                };

                var newPos = {
                    x: Math.floor(coord.x / grid.tileSize),
                    y: Math.floor(coord.y / grid.tileSize)
                };

                if (!$el.hasClass(grid.modelClass.replace('.', ''))) {
                    grid.moveTile(oldPos.x, oldPos.y, newPos.x, newPos.y);
                } else {
                    if (grid.getTileById($el.data('id')).length) return console.log('id already exists');

                    // Find the first available empty x and y coordinate if the drop location is occupied
                    var occupied = grid.hasTile(newPos.x, newPos.y);
                    if (occupied) {
                        var emptyTile = grid.getEmptyTile();
                        newPos.x = emptyTile.x;
                        newPos.y = emptyTile.y;
                    }

                    // Create a new tile from data attributes
                    grid.addTile(newPos.x, newPos.y, $el.text(), $el.data('id'));
                }
            },

            disable: function (e) {
                e.preventDefault();
                e.stopPropagation();
            },

            tileDragStart: function (e) {
                _dragTarget = this;
            },

            addRow: function () {
                grid.setSize(grid.cols, grid.rows + 1);
            },

            removeRow: function () {
                grid.setSize(grid.cols, grid.rows - 1);
            },

            addCol: function () {
                grid.setSize(grid.cols + 1, grid.rows);
            },

            removeCol: function () {
                grid.setSize(grid.cols - 1, grid.rows);
            }
        };

        // @TODO Drag and drop hooks
        var grid = {
            $el: this,
            $list: $('<ul></ul>'),

            init: function () {
                var self = this;

                // Generate markup
                this.setSize(this.cols, this.rows);
                this.$el.append(this.$list);
                this.$el.append('<div class="grid-size grid-size-rows"><span class="grid-size-remove glyphicon glyphicon-minus"></span><span class="grid-size-add glyphicon glyphicon-plus"></span></div>')
                this.$el.append('<div class="grid-size grid-size-cols"><span class="grid-size-remove glyphicon glyphicon-minus"></span><span class="grid-size-add glyphicon glyphicon-plus"></span></div>')

                this.bind();
                this.bindModels();

                // Create tiles from data if present
                this.data.forEach(function (d) {
                    self.addTile(d.x, d.y, d.content, d.id, d);
                });
            },

            bind: function () {
                this.$el.find('.grid-size-rows .grid-size-add')
                    .click(_event.addRow);
                this.$el.find('.grid-size-rows .grid-size-remove')
                    .click(_event.removeRow);
                this.$el.find('.grid-size-cols .grid-size-add')
                    .click(_event.addCol);
                this.$el.find('.grid-size-cols .grid-size-remove')
                    .click(_event.removeCol);

                this.$list
                    .on('dragover', _event.disable)
                    .on('dragenter', _event.disable)
                    .on('drop', _event.listDrop);
            },

            bindModels: function () {
                $(this.modelClass).unbind()
                    .on('dragstart', _event.tileDragStart);
            },

            setSize: function (x, y) {
                // Enforce a minimum size
                if (x < 3) x = 3;
                if (y < 3) y = 3;

                // Check to see if this will clip out an existing item
                if (x < this.cols) {
                    var tiles = this.$el.find('[data-x="' + x + '"]');
                    if (tiles.length) return;
                }

                if (y < this.rows) {
                    var tiles = this.$el.find('[data-y="' + y + '"]');
                    if (tiles.length) return;
                }

                // Set the size
                this.cols = x;
                this.rows = y;
                this.$list.css({
                    width: x * this.tileSize + 'px',
                    height: y * this.tileSize + 'px'
                });
            },

            addTile: function (x, y, content, id, options) {
                var self = this;

                // Tweak size of the grid to fix overflowing tiles
                if (x >= this.cols) this.setSize(x + 1, this.rows);
                if (y >= this.rows) this.setSize(this.cols, y + 1);

                // Append with proper CSS and data
                var $el = $('<li draggable="true">' + content + '<span class="grid-tile-remove glyphicon glyphicon-trash"></span></li>')
                    .appendTo(this.$list)
                    .attr({
                        'data-x': x,
                        'data-y': y,
                        'data-id': id
                    })
                    .css({
                        left: x * this.tileSize + 'px',
                        top: y * this.tileSize + 'px',
                        width: this.tileSize + 'px',
                        height: this.tileSize + 'px'
                    })
                    .on('dragstart', _event.tileDragStart);

                if (options && options.connections) {
                    if (options.connections.north) $el.append('<span class="direction north"></span>');
                    if (options.connections.west) $el.append('<span class="direction west"></span>');
                    if (options.connections.east) $el.append('<span class="direction east"></span>');
                    if (options.connections.south) $el.append('<span class="direction south"></span>');
                }

                $el.find('.grid-tile-remove').click(function () {
                    $(this).parents('li').detach();
                });
            },

            moveTile: function (x1, y1, x2, y2) {
                var $squatter = this.getTile(x2, y2);
                var $tile = this.getTile(x1, y1);

                if ($squatter.length) {
                    this.swapTile(x1, y1, x2, y2);
                } else {
                    this.setTile(x1, y1, x2, y2);
                }


            },

            swapTile: function (x1, y1, x2, y2) {
                var $a = this.getTile(x2, y2);
                var $b = this.getTile(x1, y1);

                $a.css({
                    left: x1 * this.tileSize + 'px',
                    top: y1 * this.tileSize + 'px'
                })
                .attr('data-x', x1)
                .attr('data-y', y1);

                $b.css({
                    left: x2 * this.tileSize + 'px',
                    top: y2 * this.tileSize + 'px'
                })
                .attr('data-x', x2)
                .attr('data-y', y2);
            },

            setTile: function (x1, y1, x2, y2) {
                var $tile = this.getTile(x1, y1);
                $tile.css({
                    left: x2 * this.tileSize + 'px',
                    top: y2 * this.tileSize + 'px'
                })
                .attr('data-x', x2)
                .attr('data-y', y2);
            },

            getTile: function (x, y) {
                return $('li[data-x="' + x + '"][data-y="' + y + '"]');
            },

            hasTile: function (x, y) {
                return $('li[data-x="' + x + '"][data-y="' + y + '"]').length ? true : false;
            },

            getEmptyTile: function () {
                for (var y = 0; y < this.rows; y++) {
                    for (var x = 0; x < this.cols; x++) {
                        var tile = this.$el.find('[data-x="' + x + '"][data-y="' + y + '"]');
                        if (!tile.length) return {
                            x: x,
                            y: y
                        };
                    }
                }
            },

            getTileById: function (id) {
                return this.$el.find('[data-id="' + id + '"]');
            },

            serialize: function () {
                return this.$el.find('li').map(function () {
                    var data = this.dataset;
                    var h = {};
                    for (var key in data) { h[key] = data[key]; }

                    h.x = parseInt(data.x, 10);
                    h.y = parseInt(data.y, 10);
                    h.id = parseInt(data.id, 10);

                    return h;
                });
            },

            /**
             * Returns a serlialized 2D array of all the grid ids
             */
            serialize2d: function () {
                var stack = [];

                for (var y = 0; y < this.rows; y++) {
                    stack.push([]);
                    for (var x = 0; x < this.cols; x++) {
                        var tile = this.getTile(x, y);
                        stack[y].push(tile.length ? parseInt(tile.attr('data-id'), 10) : null);
                    }
                }

                return stack;
            }
        };
        $.extend(grid, defaults, options);

        grid.init();

        return grid;
    };
})(jQuery);