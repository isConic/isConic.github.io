const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cw = (canvas.width = 400),
  cx = cw / 2;
const ch = (canvas.height = 400),
  cy = ch / 2;

ctx.shadowBlur=5;
ctx.shadowOffsetX=1;
ctx.shadowOffsetY=1;
ctx.shadowColor="#333";

ctx.strokeStyle = "black";
const colors = [
  "#FA2E59",
  "#FF703F",
  "#FF703F",
  "#F7BC05",
  "#ECF6BB",
  "#76BCAD"
];
// possible combinations of corners to draw a triangle
const combinations = [[0, 1, 3], [0, 1, 2], [1, 2, 3], [0, 2, 3]];
let frames = 0;
let rid = null;// request animation id

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(point) {
    return (
      point.x > this.x - this.w &&
      point.x < this.x + this.w &&
      point.y > this.y - this.h &&
      point.y < this.y + this.h
    );
  }
}

class QuadTree {
  constructor(boundary, n) {
    this.boundary = boundary;
    this.corners = [
      {
        //tl
        x: this.boundary.x - this.boundary.w,
        y: this.boundary.y - this.boundary.h
      },

      {
        //tr
        x: this.boundary.x + this.boundary.w,
        y: this.boundary.y - this.boundary.h
      },
      {
        //br
        x: this.boundary.x + this.boundary.w,
        y: this.boundary.y + this.boundary.h
      },
      {
        //bl
        x: this.boundary.x - this.boundary.w,
        y: this.boundary.y + this.boundary.h
      }
    ];
    this.color = colors[~~(Math.random() * colors.length)];
    // the combination of corners used to draw the triangle
    this.combination = combinations[~~(Math.random() * combinations.length)];
    // the max of points inside
    this.capacity = n;
    this.points = [];
    // a boolean th know if the rect is allready divided
    this.divided = false;
  }

  drawTriangle(set) {
    // use a set of 3 points to draw a triangle
    ctx.beginPath();
    ctx.moveTo(this.corners[set[0]].x, this.corners[set[0]].y);
    ctx.lineTo(this.corners[set[1]].x, this.corners[set[1]].y);
    ctx.lineTo(this.corners[set[2]].x, this.corners[set[2]].y);
    ctx.closePath();
    ctx.fill();
    //ctx.stroke();
  }

  subdivide() {
    let x = this.boundary.x;
    let y = this.boundary.y;
    let w = this.boundary.w; //half width
    let h = this.boundary.h; //half height

    let ne = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
    let nw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);
    let se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);
    let sw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);

    this.nw = new QuadTree(nw, this.capacity); //North West
    this.ne = new QuadTree(ne, this.capacity); //North East
    this.sw = new QuadTree(sw, this.capacity); //South West
    this.se = new QuadTree(se, this.capacity); //South East

    this.divided = true;
  }

  insert(point) {
    if (!this.boundary.contains(point)) {
      return;
    }

    if (this.points.length < this.capacity) {
      this.points.push(point);
    } else {
      if (!this.divided) {
        this.subdivide();
      }
      this.nw.insert(point);
      this.ne.insert(point);
      this.sw.insert(point);
      this.se.insert(point);
    }
  }

  show() {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "rgba(0,0,0,.5)";

    this.drawTriangle(this.combination);

    if (this.divided) {
      this.nw.show();
      this.ne.show();
      this.sw.show();
      this.se.show();
    }
  }
}

let boundary = new Rectangle(200, 200, 200, 200);

qt = new QuadTree(boundary, 4);



function Frame() {
  rid = requestAnimationFrame(Frame);
  frames++;

  if (frames < 300) {
    //get the position of a random point______________
    let _time = new Date().getTime() / 30;
    let x =
      cx +
      Math.cos(_time / 23 + Math.cos(_time / 29 + frames * Math.PI / 180)) * cx;
    let y =
      cy +
      Math.sin(_time / 31 + Math.cos(_time / 37 + frames * Math.PI / 180)) * cy;
    //________________________________________________

    //ctx.clearRect(0,0,cw,ch);
    qt.insert(new Point(x, y));
    qt.show();
  } else {
    cancelAnimationFrame(rid);
  }
}

Frame();

//resume animation on click
canvas.addEventListener("click", () => {
  delete qt;
  qt = new QuadTree(boundary, 4);
  ctx.clearRect(0, 0, cw, ch);
  frames = 0;
  if (rid) {
    cancelAnimationFrame(rid);
    rid = null;
  }
  Frame();
});