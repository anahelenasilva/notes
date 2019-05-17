let database = (function () {
    const self = this;
    let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    self.open = () => {
        return new Promise(function (resolve, reject) {
            let request = indexedDB.open('notes');
            request.onupgradeneeded = function () {
                let db = request.result;
                let store = db.createObjectStore('notes', { keyPath: 'id' });
                store.createIndex('by_id', 'id', { unique: true });
                store.createIndex('by_name', 'name');
                store.createIndex('by_date', 'date');
            };

            request.onsuccess = function () {
                self.db = request.result;
                resolve(true);
            };

            request.onerror = function (err) {
                reject(false);
                console.log('Erro ao criar database');

            };
        });
    };

    self.loadAll = () => {
        return new Promise(function (resolve, reject) {
            let tx = self.db.transaction('notes', 'readonly');
            let store = tx.objectStore('notes');
            let request = store.getAll();
            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(false);
                console.log('Erro ao retornar dados');
            };
        });
    };

    self.save = (obj) => {
        let tx = self.db.transaction('notes', 'readwrite');
        let store = tx.objectStore('notes');
        var requestUpdate = store.put({ id: Math.random(), description: obj.description, date: obj.date });
        requestUpdate.onsuccess = function () {
            resolve(true);
        };

        requestUpdate.onerror = function () {
            reject(false);
            console.log('Erro ao salvar dados');
        };
    };

    self.update = (obj) => {
        let tx = self.db.transaction('notes', 'readwrite');
        let store = tx.objectStore('notes');
        let update = store.put(obj);

        update.onsuccess = function () {
            resolve(true);
        };

        update.onerror = function () {
            reject(false);
            console.log('Erro ao editar dados');
        };
    };

    self.delete = (id) => {
        let tx = self.db.transaction('notes', 'readwrite');
        let store = tx.objectStore('notes');
        store.delete(id);

        tx.complete = function () {
            resolve(true);
        };

        tx.onerror = function () {
            reject(false);
            console.log('Erro ao deletar dado');
        };
    };

    return {
        open: self.open,
        loadAll: self.loadAll,
        save: self.save,
        delete: self.delete,
        update: self.update
    };
})();


let view = (function () {
    let self = this;
    self.buildView = (result) => {
        document.getElementById("addNewNote").onclick = function()
         {
            if (document.getElementById('addNewNote').text != "update" ) {
                controller.save(document.getElementById("name").value, 
                                document.getElementById("description").value,
                                document.getElementById("date").value);
            }
            else {
                let identifier = document.getElementById("addNewNote").getAttribute("identifier");
                controller.save(parseFloat(identifier),
                                document.getElementById("name").value, 
                                document.getElementById("description").value,
                                document.getElementById("date").value);
            }

            result.forEach(function(element, index) {
                //container
                let elementContainer = document.createElement("div");
                elementContainer.className = "col-md-3 card card-body";

                //date
                let elementDate = document.createElement("p");
                let nodeElementDate = document.createTextNode(element.date);
                elementDate.appendChild(nodeElementDate);
                
                //name
                let elementName  = document.createElement("p");
                let nodeElementName = document.createTextNode(element.name);
                elementName.appendChild(nodeElementName);
                
                //description
                let elementDescription  = document.createElement("p");
                let nodeElementDesc = document.createTextNode(element.description);
                elementDescription.appendChild(nodeElementDesc);

                //delete
                let deleteBtn = document.createElement("button");
                deleteBtn.className = "btn btn-danger";
                deleteBtn.setAttribute("id", index);
                let nodeElementDelete = document.createTextNode("Delete");
                deleteBtn.appendChild(nodeElementDelete);
                deleteBtn.onclick = function () {
                    controller.delete(element.id);
                };

                //editar
                let editBtn = document.createElement("button");
                editBtn.className = "btn btn-link";
                editBtn.setAttribute("id", "edit_" + index);
                editBtn.onclick = function () {
                    document.getElementById("name").value = element.name;
                    document.getElementById("description").value = element.description;
                    document.getElementById("date").value = element.date;
                    document.getElementById("addNewNote").setAttribute("identifier", element.identifier);
                };
                let nodeElementEdit = document.createTextNode("Edit");
                editBtn.appendChild(nodeElementEdit);


                elementContainer.appendChild(elementDate);
                elementContainer.appendChild(elementName);
                elementContainer.appendChild(elementDescription);
                elementContainer.appendChild(deleteBtn);
                elementContainer.appendChild(editBtn);

                document.getElementById("notes").appendChild(elementContainer);
            });
         };
    };

    return {
        buildView: self.buildView
    };
})();


let controller = (function () {
    let self = this;
    self.createDB = () => {
        database.open().then(function(val){
            if (val) {
                database.loadAll().then(function(result){
                    view.buildView(result);
                });
            }
        });
    };

    self.loadAll = () => {
        database.loadAll();
    };

    self.save = (name, description, date) => {
        database.save({ name: name, description: description, date: date })
        .then(function(val){
            if (val) {
                location.reload();
            }
        });
    };

    self.update = (id, name, description, date) => {
        database.update({ id: id, name: name, description: description, date: date })
        .then(function(val){
            if (val) {
                location.reload();
            }
        });
    };

    self.delete = (id) => {
        database.delete({ id: id })
        .then(function(val){
            if (val) {
                location.reload();
            }
        });
    };

    return {
        createDB: self.createDB,
        loadAll: self.loadAll,
        save: self.save,
        update: self.update,
        delete: self.delete
    };
})();

let app = (function () {
    let self = this;

    self.start = () => controller.createDB();

    return {
        start: self.start
    };
})();

window.onload = function () {
    app.start();
};
