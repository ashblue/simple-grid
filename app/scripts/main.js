var grid = $('#grid').grid({
    data: [
        {
            x: 1,
            y: 1,
            content: 'Some test content',
            id: 1,
            connections: {
                north: true,
                west: true,
                east: true,
                south: true
            }
        },
        {
            x: 3,
            y: 3,
            content: 'Force stretch container',
            id: 10,
            connections: {
                north: true,
                west: false,
                east: false,
                south: false
            }
        }
    ]
});

$(document).ready(function () {
    var models = $('#data-models a');
});