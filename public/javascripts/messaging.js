/**
 * Created by BryanJ on 1/11/14.
 */
$(function() {
    var socket = io.connect();
    socket.on('news', function (data) {
        show(data);
    });
    $('#btn').on('click', function() {
        var msg = $('#msg').val();
        $('#msg').val('');
        show(msg);
        socket.emit('message', msg);
    });
});
function show(msg) {
    $('#messages').append('<li>' + msg + '</li>')
}