function greyOut() {
    for (let i = 0; i < 240; i++) {
        if (this.f[i] != 0) {
            this.f[i] = 8
        }
    }
    this.drawfield();
}

addon_ui += '<input type=button value="Grey Out" onclick="greyOut();"><br>';