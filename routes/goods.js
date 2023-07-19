module.exports = function (pool) {
  const express = require("express");
  const router = express.Router();
  const path = require("path");

  router.get("/", function (req, res, next) {
    const stockAlert = req.session.stockAlert;
    pool.query("SELECT * FROM goods", (err, data) => {
      if (err) {
        console.log(err);
      }
      res.render("goods/index", {
        data: data.rows,
        user: req.session.user,
        stockAlert,
        error: req.flash("error"),
      });
    });
  });

  router.get("/add", (req, res) => {
    const stockAlert = req.session.stockAlert;
    pool.query("SELECT * FROM units", (err, data) => {
      if (err) {
        console.log(err);
        req.flash("error", err.message);
        return res.redirect("/goods");
      }
      const isiUnit = data.rows; // Simpan hasil query di variabel isiUnit
      res.render("goods/add", {
        data: {},
        item: data.rows,
        renderFrom: "add",
        user: req.session.user,
        stockAlert,
        error: req.flash("error"),
        isiUnit: isiUnit // Kirim nilai isiUnit ke view
      });
    });
  });

  router.post("/add", (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      req.flash("error", "insert goods data");
      return res.redirect(`/goods/add`);
    }

    let picture = req.files.picture;
    pictureName = `${Date.now()}-${picture.name}`;
    let uploadPath = path.join(
      __dirname,
      "..",
      "public",
      "images",
      "picture",
      pictureName
    );

    picture.mv(uploadPath, function (err) {
      if (err) return res.status(500).send(err);

      pool.query(
        "INSERT INTO goods(barcode, name, stock, purchaseprice, sellingprice, picture, unit) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          req.body.barcode,
          req.body.name,
          req.body.stock,
          req.body.purchaseprice,
          req.body.sellingprice,
          pictureName,
          req.body.unit,
        ],
        (err, data) => {
          if (err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect(`/goods/add`);
          }
          res.redirect("/goods");
        }
      );
    });
  });

  router.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const stockAlert = req.session.stockAlert;
    pool.query("select * from goods where barcode = $1", [id], (err, items) => {
      pool.query("select * from units", (err, data) => {
        if (err) {
          console.log(err);
        }
        res.render("goods/edit", {
          data: items.rows[0],
          item: data.rows,
          renderFrom: "edit",
          user: req.session.user,
          stockAlert,
          error: req.flash("error"),
        });
      });
    });
  });

  router.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    if (!req.files || Object.keys(req.files).length === 0) {
      pool.query(
        "UPDATE goods SET barcode=$1, name=$2, stock=$3, purchaseprice=$4, sellingprice=$5, unit=$6 WHERE barcode=$7",
        [
          req.body.barcode,
          req.body.name,
          req.body.stock,
          req.body.purchaseprice,
          req.body.sellingprice,
          req.body.unit,
          id,
        ],
        function (err) {
          if (err) {
            console.error(err);
            req.flash("error", err.message);
            return res.redirect(`/goods/edit/${id}`);
          } else {
            res.redirect("/goods");
          }
        }
      );
    } else {
      let picture = req.files.picture;
      pictureName = `${Date.now()}-${picture.name}`;
      let uploadPath = path.join(
        __dirname,
        "..",
        "public",
        "images",
        "picture",
        pictureName
      );

      picture.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
        pool.query(
          "UPDATE goods SET barcode=$1, name=$2, stock=$3, purchaseprice=$4, sellingprice=$5, picture=$6, unit=$7 WHERE barcode=$8",
          [
            req.body.barcode,
            req.body.name,
            req.body.stock,
            req.body.purchaseprice,
            req.body.sellingprice,
            pictureName,
            req.body.unit,
            id,
          ],
          function (err) {
            if (err) {
              console.error(err);
              req.flash("error", err.message);
              return res.redirect(`/goods/edit/${id}`);
            } else {
              res.redirect("/goods");
            }
          }
        );
      });
    }
  });

  router.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    pool.query("delete from goods where barcode = $1", [id], (err) => {
      if (err) {
        console.log("hapus data Goods gagal");
        req.flash("error", err.message);
        return res.redirect(`/`);
      }
      res.redirect("/goods");
    });
  });

  router.get("/datagoods", async (req, res) => {
    let params = [];
    if (req.query.search.value) {
      const searchValue = req.query.search.value;
      params.push(`barcode ILIKE '%${searchValue}%'`);
      params.push(`name ILIKE '%${searchValue}%'`);
      params.push(`unit ILIKE '%${searchValue}%'`);
      // casting, changing the stock from integer into string
      params.push(`stock::text ILIKE '%${searchValue}%'`);
    }

    const limit = req.query.length;
    const offset = req.query.start;
    const sortBy = req.query.columns[req.query.order[0].column].data;
    const sortMode = req.query.order[0].dir;

    const total = await pool.query(
      `select count(*) as total from goods${params.length > 0 ? ` where ${params.join(" or ")}` : ""
      }`
    );
    const data = await pool.query(
      `select * from goods${params.length > 0 ? ` where ${params.join(" or ")}` : ""
      } order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `
    );
    const response = {
      draw: Number(req.query.draw),
      recordsTotal: total.rows[0].total,
      recordsFiltered: total.rows[0].total,
      data: data.rows,
    };
    res.json(response);
  });

  return router;
};