function formDataToJson(formData) {
    let json = new Object();
    formData.forEach((value, key) => {
        json[key] = value;
    });
    return json
}
