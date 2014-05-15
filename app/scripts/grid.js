(function ($) {
    $.fn.grid = function (options) {
        var defaults = {
            tileSize: 100,
            cols: 3,
            rows: 3,
            margin: 10,
            data: []
        };

        var _dragTarget;

        var _event = {
            listDrop: function (e) {
                var offset = $(this).offset();
                var coord = {
                    x: e.originalEvent.clientX - offset.left,
                    y: e.originalEvent.clientY - offset.top
                };

                var oldPos = {
                    x: parseInt($(_dragTarget).attr('data-x'), 10),
                    y: parseInt($(_dragTarget).attr('data-y'), 10)
                };

                var newPos = {
                    x: Math.floor(coord.x / grid.tileSize),
                    y: Math.floor(coord.y / grid.tileSize)
                };

                grid.moveTile(oldPos.x, oldPos.y, newPos.x, newPos.y);
            },

            disable: function (e) {
                e.preventDefault();
                e.stopPropagation();
            },

            tileDragStart: function () {
                _dragTarget = this;
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

                this.$list.css({
                        position: 'relative'
                    })
                    .on('dragover', _event.disable)
                    .on('dragenter', _event.disable)
                    .on('drop', _event.listDrop);

                // Create tiles from data if present
                this.data.forEach(function (d) {
                    self.addTile(d.x, d.y, d.content);
                });
            },

            setSize: function (x, y) {
                this.cols = x;
                this.rows = y;
                this.$list.css({
                    width: x * this.tileSize + 'px',
                    height: y * this.tileSize + 'px'
                });
            },

            addTile: function (x, y, content, id) {
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

            getTileById: function (id) {

            },

            /**
             * Returns a serlialized 2D array of all the grid ids
             */
            serialize: function () {

            }
        };
        $.extend(grid, defaults, options);

        grid.init();

        return grid;
    };
})(jQuery);