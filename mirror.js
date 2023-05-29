reverseMinoMapping = {
    7: 4,
    4: 7,
    6: 2,
    2: 6,
	0: 0,
	1: 1,
	3: 3,
	5: 5,
	8: 8
}

reverseRotationMapping = {
	0: 0,
	1: 3,
	2: 2,
	3: 1
}

function mirror() {
	for (let y = 0; y < fldlines; y++) {
		row = f.slice(y*10, (y+1)*10)
		for (let x = 0; x < 10; x++) {
			this.f[y*10+x] = reverseMinoMapping[row[9-x]];
		}
	}

	mino = this.p[0];
	rotation = this.p[1];
	coords = this.p[2];
	x = coords % 10;
	y = ~~(coords/10);
	if (mino) {
		mino = reverseMinoMapping[mino];
		x = 9 - x;
		if (mino !== 1 && mino !== 3) {
			rotation = reverseRotationMapping[rotation];
		} else if (mino === 3) {
			x--;
		} else if (rotation === 0 || rotation === 2) {
			x--;
		}
	}
	this.p[0] = mino;
	this.p[1] = rotation;
	this.p[2] = y * 10 + x;

	this.drawpiece();
	this.drawfield();
}

addon_ui += '<input type=button value="Mirror" onclick="mirror();"><br>'
