(function () {
    $('#grid').grid({
        data: [
            {
                x: 1,
                y: 1,
                content: 'Some test content',
                id: 1
            },
            {
                x: 3,
                y: 3,
                content: 'Force stretch container'
            }
        ]
    });
})();
