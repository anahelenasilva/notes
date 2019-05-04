let database = (function () {
    const self = this;
    let indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;

    self.open = () => {
        return new Promise(function (resolve, reject) {
            let request = indexedDB.open('notes');
            request.onupgradeneeded = function () {
                let db = request.result;
                let store = db.creteObjectStore('notes', { keyPath: 'id' });
                store.createIndex('by_id', 'id', { unique: true });
                store.createIndex('by_name', 'name');
                store.createIndex('by_date', 'date');
            };

            request.onsuccess = function () {
                self.db = request.result;
                resolve(true);
            };

            request.onerror = function () {
                reject(false);
                console.log('Erro ao criar database');

            };
        });
    };

    self.loadAll = () => {
        return new Promisse(function (resolve, reject) {
            let tx = self.db.transation('notes', 'readonly');
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
        let tx = self.db.transation('notes', 'readwrite');
        let store = tx.objectStore('notes');
        store.put({ id: Math.random(), description: obj.description, date: obj.date });
        tx.complete = function () {
            resolve(true);
        };

        tx.onerror = function () {
            reject(false);
            console.log('Erro ao salvar dados');
        };
    };

    self.update = (obj) => {
        let tx = self.db.transation('notes', 'readwrite');
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
        let tx = self.db.transation('notes', 'readwrite');
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
