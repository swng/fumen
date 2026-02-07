function greyOut() {
    for (let i = 0; i < 240; i++) {
        if (this.f[i] != 0) {
            this.f[i] = 8
        }
    }
    this.drawfield();
    updated();
}

addon_ui += '<input type=button id="gout" value="Grey Out" onclick="greyOut();"><br>';