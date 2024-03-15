var width = 150
var height = 150

class Boid{
    constructor(pos_x, pos_y, vel_x, vel_y, len){
        this.x = pos_x;
        this.y = pos_y;
        this.vx = vel_x
        this.vy = vel_y
        this.len = len
    }

    draw(canvas_context){
        var angle = this.get_angle()
        
        var tip_y = Math.floor(this.y + Math.sin(angle) * this.len)
        var tip_x = Math.floor(this.x + Math.cos(angle) * this.len)
        
        var point1_x = Math.floor((tip_x - this.x) * Math.cos(2*Math.PI/3) - (tip_y - this.y) * Math.sin(2*Math.PI/3)) + this.x
        var point1_y = Math.floor((tip_x - this.x) * Math.sin(2*Math.PI/3) + (tip_y - this.y) * Math.cos(2*Math.PI/3)) + this.y

        var point2_x = Math.floor((tip_x - this.x) * Math.cos(-2*Math.PI/3) - (tip_y - this.y) * Math.sin(-2*Math.PI/3)) + this.x
        var point2_y = Math.floor((tip_x - this.x) * Math.sin(-2*Math.PI/3) + (tip_y - this.y) * Math.cos(-2*Math.PI/3)) + this.y
        
        var path = new Path2D()
        path.moveTo(tip_x, tip_y)
        path.lineTo(point1_x, point1_y)
        path.lineTo(point2_x, point2_y)
        path.moveTo(point1_x, point1_y)
        path.lineTo(point2_x, point2_y)
        canvas_context.fill(path) 
    }

    get_angle(){
        if(this.vx == 0) return Math.PI / 2 * Math.sign(this.vy)
        return Math.atan(this.vy / this.vx)
    }
}

function get_distance(boid_1, boid_2){
    return Math.sqrt((boid_1.x - boid_2.x) * (boid_1.x - boid_2.x) + (boid_1.y - boid_2.y) * (boid_1.y - boid_2.y))
}

function move_boid(boid, boid_list, visible_range, protected_range, avoid_factor, match_factor, center_factor, turn_factor){
    var xpos_avg = 0
    var ypos_avg = 0
    var xvel_avg = 0 
    var yvel_avg = 0
    var neighboring_boids = 0
    var close_dx = 0
    var close_dy = 0

    var max_speed = 15

    for(let i = 0; i < boid_list.length; i++){
        if(boid == boid_list[i]) continue
        var distance = get_distance(boid, boid_list[i])
        if(distance < protected_range){
            close_dx += boid.x - boid_list[i].x
            close_dy += boid.y - boid_list[i].y

        } else if (distance < visible_range){
            xpos_avg += boid_list[i].x
            ypos_avg += boid_list[i].y
            xvel_avg += boid_list[i].vx
            yvel_avg += boid_list[i].vy
            neighboring_boids += 1
        }
    }

    if(neighboring_boids > 0){
        xpos_avg /= neighboring_boids
        ypos_avg /= neighboring_boids
        xvel_avg /= neighboring_boids
        yvel_avg /= neighboring_boids

        boid.vx = boid.vx + (xpos_avg - boid.x) * center_factor + (xvel_avg - boid.vx) * match_factor
        boid.vy = boid.vy + (ypos_avg - boid.y) * center_factor + (yvel_avg - boid.vy) * match_factor
    }

    boid.vx = boid.vx + close_dx * avoid_factor
    boid.vy = boid.vy + close_dy * avoid_factor

    var margin = 200

    if(boid.x > width - margin) boid.vx -= turn_factor
    if(boid.x < margin) boid.vx += turn_factor
    if(boid.y > height - margin) boid.vy -= turn_factor
    if(boid.y < margin) boid.vy += turn_factor

    var speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy)
    
    if(speed > max_speed){
        boid.vx = (boid.vx/speed) * max_speed
        boid.vy = (boid.vy/speed) * max_speed
    }

    boid.x += boid.vx
    boid.y += boid.vy
}

var boid_cnt = 500

var canvas = null
var context = null
var boids = []

function initBoids(){
    canvas = document.getElementById('screen')
    context = canvas.getContext('2d')
    width = window.innerWidth
    height = window.innerHeight - 200
    canvas.width = width
    canvas.height = height
    for(let i = 0; i < boid_cnt; i++){
        boids.push(new Boid(Math.floor(Math.random()*width),Math.floor(Math.random()*height),
        Math.floor(Math.random()*10-5),Math.floor(Math.random()*10 - 5),5))
    }
}

function animationLoop(){
    context.clearRect(0, 0, width, height)
    for(let i = 0; i < boid_cnt; i++){
        var vis_range = document.getElementById("visible").value
        var prot = document.getElementById("protected").value
        var mf = document.getElementById("match").value
        var cf = document.getElementById("center").value
        move_boid(boids[i], boids, vis_range, prot, 0.05, mf, 0.0005, 0.4)
        boids[i].draw(context)
    }
    window.requestAnimationFrame(animationLoop);
}

window.onload = () => {
    
    initBoids();
    window.requestAnimationFrame(animationLoop);
};