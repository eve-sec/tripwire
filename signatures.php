<?php

class signature {
    protected $id = null;
    protected $signatureID = null;
    protected $systemID = null;
    protected $type = ['unknown', 'combat', 'data', 'relic', 'ore', 'gas', 'wormhole'];
    protected $name = null;
    protected $bookmark = null;
    protected $lifeTime = null;
    protected $lifeLength = 259200; //seconds (72hrs)
    protected $lifeLeft = null;
    protected $createdByID = null;
    protected $createdByName = null;
    protected $modifiedByID = null;
    protected $modifiedByName = null;
    protected $modifiedTime = null;
    protected $maskID = 0;

    public function __construct(Array $signature = array()) {
        $this->id = isset($signature['id']) && is_numeric($signature['id']) ? (int)$signature['id'] : $this->id;
        $this->signatureID = isset($signature['signatureID']) && !empty($signature['signatureID']) ? strtolower($signature['signatureID']) : $this->signatureID;
        $this->systemID = isset($signature['systemID']) && is_numeric($signature['systemID']) ? (int)$signature['systemID'] : $this->systemID;
        $this->type = isset($signature['type']) && in_array(strtolower($signature['type']), $this->type) ? strtolower($signature['type']) : $this->type[0];
        $this->name = isset($signature['name']) && !empty($signature['name']) ? $signature['name'] : $this->name;
        $this->bookmark = isset($signature['bookmark']) && !empty($signature['bookmark']) ? $signature['bookmark'] : $this->bookmark;
        $this->lifeTime = isset($signature['lifeTime']) && (bool)strtotime($signature['lifeTime']) ? date('Y-m-d H:i:s', strtotime($signature['lifeTime'])) : date('Y-m-d H:i:s');
        $this->lifeLength = isset($signature['lifeLength']) && is_numeric($signature['lifeLength']) ? (int)$signature['lifeLength'] : $this->lifeLength;
        $this->lifeLeft = isset($signature['lifeLeft']) && (bool)strtotime($signature['lifeLeft']) ? date('Y-m-d H:i:s', strtotime($signature['lifeLeft'])) : date('Y-m-d H:i:s', strtotime('+'.$this->lifeLength.' seconds', strtotime($this->lifeTime)));
        $this->createdByID = isset($signature['createdByID']) && is_numeric($signature['createdByID']) ? (int)$signature['createdByID'] : $_SESSION['characterID'];
        $this->createdByName = isset($signature['createdByName']) && !empty($signature['createdByName']) ? $signature['createdByName'] : $_SESSION['characterName'];
        $this->modifiedByID = isset($signature['modifiedByID']) && is_numeric($signature['modifiedByID']) ? (int)$signature['modifiedByID'] : $_SESSION['characterID'];
        $this->modifiedByName = isset($signature['modifiedByName']) && !empty($signature['modifiedByName']) ? $signature['modifiedByName'] : $_SESSION['characterName'];
        $this->modifiedTime = isset($signature['modifiedTime']) && (bool)strtotime($signature['modifiedTime']) ? date('Y-m-d H:i:s', strtotime($signature['modifiedTime'])) : date('Y-m-d H:i:s');
        $this->maskID = (float)$_SESSION['mask'];
    }

    public function __get($property) {
        switch($property) {
            default:
                return $this->$property;
                break;
        }
    }

    public function __set($property, $value) {
        switch($property) {
            case 'id':
                $this->id = is_numeric($value) ? (int)$value : $this->id;
                break;
            case 'signatureID':
                $this->signatureID = $value;
                break;
            case 'systemID':
                $this->systemID = is_numeric($value) ? (int)$value : null;
                break;
            case 'type':
                $this->type = in_array(strtolower($value), ['unknown', 'combat', 'data', 'relic', 'ore', 'gas', 'wormhole']) ? strtolower($value) : $this->type;
                break;
            case 'name':
                $this->name = $value;
                break;
            case 'bookmark':
                $this->bookmark = $value;
                break;
            case 'lifeTime':
                $this->lifeTime = (bool)strtotime($value) ? date('Y-m-d H:i:s', strtotime($value)) : $this->lifeTime;
                break;
            case 'lifeLength':
                if ((int)$value !== 0 && (int)$this->lifeLength === 0) {
                    $this->lifeTime = date('Y-m-d H:i:s', time());
                }
                $this->lifeLength = is_numeric($value) ? (int)$value : $this->lifeLength;
                $this->lifeLeft = date('Y-m-d H:i:s', strtotime('+'.$this->lifeLength.' seconds', strtotime($this->lifeTime)));
                break;
            case 'lifeLeft':
                $this->lifeLeft = (bool)strtotime($value) ? date('Y-m-d H:i:s', strtotime($value)) : $this->lifeLeft;
                break;
            case 'createdByID':
                $this->createdByID = is_numeric($value) ? (int)$value : $this->createdByID;
                break;
            case 'createdByName':
                $this->createdByName = $value;
                break;
            case 'modifiedByID':
                $this->modifiedByID = is_numeric($value) ? (int)$value : $this->modifiedByID;
                break;
            case 'modifiedByName':
                $this->modifiedByName = $value;
                break;
            case 'modifiedTime':
                $this->modifiedTime = (bool)strtotime($value) ? date('Y-m-d H:i:s', strtotime($value)) : $this->modifiedTime;
        }
    }

    public function output() {
        return get_object_vars($this);
    }
}

class wormhole {
    protected $id = null;
    protected $initialID = null;
    protected $secondaryID = null;
    protected $type = null;
    protected $parent = ['initial', 'secondary'];
    protected $life = ['stable', 'critical'];
    protected $mass = ['stable', 'destab', 'critical'];
    protected $maskID = 0;

    public function __construct(Array $wormhole = array()) {
        $this->id = isset($wormhole['id']) && is_numeric($wormhole['id']) ? (int)$wormhole['id'] : $this->id;
        $this->initialID = isset($wormhole['initialID']) && is_numeric($wormhole['initialID']) ? (int)$wormhole['initialID'] : $this->initialID;
        $this->secondaryID = isset($wormhole['secondaryID']) && is_numeric($wormhole['secondaryID']) ? (int)$wormhole['secondaryID'] : $this->secondaryID;
        $this->type = isset($wormhole['type']) && !empty($wormhole['type']) ? strtoupper($wormhole['type']) : $this->type;
        $this->parent = isset($wormhole['parent']) && in_array(strtolower($wormhole['parent']), $this->parent) ? strtolower($wormhole['parent']) : null;
        $this->life = isset($wormhole['life']) && in_array(strtolower($wormhole['life']), $this->life) ? strtolower($wormhole['life']) : $this->life[0];
        $this->mass = isset($wormhole['mass']) && in_array(strtolower($wormhole['mass']), $this->mass) ? strtolower($wormhole['mass']) : $this->mass[0];
        $this->maskID = (float)$_SESSION['mask'];
    }

    public function __get($property) {
        switch($property) {
            default:
                return $this->$property;
                break;
        }
    }

    public function __set($property, $value) {
        switch($property) {
            case 'id':
                $this->id = is_numeric($value) ? (int)$value : $this->id;
                break;
            case 'initialID':
                $this->initialID = is_numeric($value) ? (int)$value : $this->initialID;
                break;
            case 'secondaryID':
                $this->secondaryID = is_numeric($value) ? (int)$value : $this->secondaryID;
                break;
            case 'type':
                $this->type = strtoupper($value);
                break;
            case 'parent':
                $this->parent = in_array(strtolower($value), ['initial', 'secondary', null]) ? strtolower($value) : $this->parent;
                break;
            case 'life':
                $this->life = in_array(strtolower($value), ['stable', 'critical']) ? strtolower($value) : $this->life;
                break;
            case 'mass':
                $this->mass = in_array(strtolower($value), ['stable', 'destab', 'critical']) ? strtolower($value) : $this->mass;
                break;
        }
    }

    public function output() {
        return get_object_vars($this);
    }
}

function fetchSignature($id, $mysql) {
    $query = 'SELECT * FROM signatures WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $id);
    $stmt->bindValue(':maskID', $_SESSION['mask']);
    $success = $stmt->execute();
    $signature = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($success && $signature) {
        return array(true, new signature($signature), null);
    }

    return array(false, null, $stmt->errorInfo());
}

function fetchWormhole($id, $mysql) {
    $query = 'SELECT * FROM wormholes WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $id);
    $stmt->bindValue(':maskID', $_SESSION['mask']);
    $success = $stmt->execute();
    $wormhole = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($success && $wormhole) {
        return array(true, new wormhole($wormhole), null);
    }

    return array(false, null, $stmt->errorInfo());
}

function findWormhole($id, $mysql) {
    $query = 'SELECT * FROM wormholes WHERE (initialID = :id OR secondaryID = :id) AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $id);
    $stmt->bindValue(':maskID', $_SESSION['mask']);
    $success = $stmt->execute();
    $wormhole = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($success && $wormhole) {
        return array(true, new wormhole($wormhole), null);
    }

    return array(false, null, $stmt->errorInfo());
}

function addSignature($signature, $mysql) {
    $signature = new signature($signature);

    $query = 'INSERT INTO signatures (signatureID, systemID, type, name, bookmark, lifeTime, lifeLeft, lifeLength, createdByID, createdByName, modifiedByID, modifiedByName, modifiedTime, maskID)
                VALUES (:signatureID, :systemID, :type, :name, :bookmark, :lifeTime, :lifeLeft, :lifeLength, :createdByID, :createdByName, :modifiedByID, :modifiedByName, :modifiedTime, :maskID)';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':signatureID', $signature->signatureID);
    $stmt->bindValue(':systemID', $signature->systemID);
    $stmt->bindValue(':type', $signature->type);
    $stmt->bindValue(':name', $signature->name);
    $stmt->bindValue(':bookmark', $signature->bookmark);
    $stmt->bindValue(':lifeTime', $signature->lifeTime);
    $stmt->bindValue(':lifeLeft', $signature->lifeLeft);
    $stmt->bindValue(':lifeLength', $signature->lifeLength);
    $stmt->bindValue(':createdByID', $signature->createdByID);
    $stmt->bindValue(':createdByName', $signature->createdByName);
    $stmt->bindValue(':modifiedByID', $signature->modifiedByID);
    $stmt->bindValue(':modifiedByName', $signature->modifiedByName);
    $stmt->bindValue(':modifiedTime', $signature->modifiedTime);
    $stmt->bindValue(':maskID', $signature->maskID);
    $success = $stmt->execute();

    if ($success) {
        // Log the user stats
        if ($signature->type != 'wormhole') {
            $query = 'INSERT INTO statistics (userID, characterID, maskID, signatures_added) VALUES (:userID, :characterID, :maskID, 1)
                ON DUPLICATE KEY UPDATE signatures_added = signatures_added + 1';
            $stmt = $mysql->prepare($query);
            $stmt->bindValue(':userID', $_SESSION['userID']);
            $stmt->bindValue(':characterID', $_SESSION['characterID']);
            $stmt->bindValue(':maskID', $signature->maskID);
            $success = $stmt->execute();
        }

        $signature->id = $mysql->lastInsertId();
        return array(true, $signature, null);
    }

    return array(false, null, $stmt->errorInfo());
}

function addWormhole($wormhole, $mysql) {
    $wormhole = new wormhole($wormhole);

    $query = 'INSERT INTO wormholes (initialID, secondaryID, type, parent, life, mass, maskID) VALUES (:initialID, :secondaryID, :type, :parent, :life, :mass, :maskID)';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':initialID', $wormhole->initialID);
    $stmt->bindValue(':secondaryID', $wormhole->secondaryID);
    $stmt->bindValue(':type', $wormhole->type);
    $stmt->bindValue(':parent', $wormhole->parent);
    $stmt->bindValue(':life', $wormhole->life);
    $stmt->bindValue(':mass', $wormhole->mass);
    $stmt->bindValue(':maskID', $wormhole->maskID);
    $success = $stmt->execute();

    if ($success) {
        // Log the user stats
        $query = 'INSERT INTO statistics (userID, characterID, maskID, wormholes_added) VALUES (:userID, :characterID, :maskID, 1)
            ON DUPLICATE KEY UPDATE wormholes_added = wormholes_added + 1';
        $stmt = $mysql->prepare($query);
        $stmt->bindValue(':userID', $_SESSION['userID']);
        $stmt->bindValue(':characterID', $_SESSION['characterID']);
        $stmt->bindValue(':maskID', $wormhole->maskID);
        $success = $stmt->execute();

        $wormhole->id = $mysql->lastInsertId();
        return array(true, $wormhole, null);
    }

    return array(false, null, $stmt->errorInfo());
}

function updateSignature(signature $signature, $mysql) {
    $query = 'UPDATE signatures SET
                signatureID = :signatureID,
                systemID = :systemID,
                type = :type,
                name = :name,
                bookmark = :bookmark,
                lifeTime = :lifeTime,
                lifeLeft = :lifeLeft,
                lifeLength = :lifeLength,
                modifiedByID = :modifiedByID,
                modifiedByName = :modifiedByName,
                modifiedTime = :modifiedTime,
                maskID = :maskID
            WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $signature->id);
    $stmt->bindValue(':signatureID', $signature->signatureID);
    $stmt->bindValue(':systemID', $signature->systemID);
    $stmt->bindValue(':type', $signature->type);
    $stmt->bindValue(':name', $signature->name);
    $stmt->bindValue(':bookmark', $signature->bookmark);
    $stmt->bindValue(':lifeTime', $signature->lifeTime);
    $stmt->bindValue(':lifeLeft', $signature->lifeLeft);
    $stmt->bindValue(':lifeLength', $signature->lifeLength);
    $stmt->bindValue(':modifiedByID', $_SESSION['characterID']);
    $stmt->bindValue(':modifiedByName', $_SESSION['characterName']);
    $stmt->bindValue(':modifiedTime', date('Y-m-d H:i:s', time()));
    $stmt->bindValue(':maskID', $signature->maskID);
    $success = $stmt->execute();

    if ($success) {
        // Log the user stats
        if ($signature->type != 'wormhole') {
            $query = 'INSERT INTO statistics (userID, characterID, maskID, signatures_updated) VALUES (:userID, :characterID, :maskID, 1)
                ON DUPLICATE KEY UPDATE signatures_updated = signatures_updated + 1';
            $stmt = $mysql->prepare($query);
            $stmt->bindValue(':userID', $_SESSION['userID']);
            $stmt->bindValue(':characterID', $_SESSION['characterID']);
            $stmt->bindValue(':maskID', $signature->maskID);
            $success = $stmt->execute();
        }

        return array(true, $signature, null);
    }

    return array(false, null, $stmt->errorInfo());
}

function updateWormhole(wormhole $wormhole, $mysql) {
    $query = 'UPDATE wormholes SET type = :type, parent = :parent, life = :life, mass = :mass WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $wormhole->id);
    $stmt->bindValue(':type', $wormhole->type);
    $stmt->bindValue(':parent', $wormhole->parent);
    $stmt->bindValue(':life', $wormhole->life);
    $stmt->bindValue(':mass', $wormhole->mass);
    $stmt->bindValue(':maskID', $wormhole->maskID);
    $success = $stmt->execute();

    if ($success) {
        // Log the user stats
        $query = 'INSERT INTO statistics (userID, characterID, maskID, wormholes_updated) VALUES (:userID, :characterID, :maskID, 1)
            ON DUPLICATE KEY UPDATE wormholes_updated = wormholes_updated + 1';
        $stmt = $mysql->prepare($query);
        $stmt->bindValue(':userID', $_SESSION['userID']);
        $stmt->bindValue(':characterID', $_SESSION['characterID']);
        $stmt->bindValue(':maskID', $wormhole->maskID);
        $success = $stmt->execute();

        return array(true, $wormhole, null);
    }

    return array(false, null, $stmt->errorInfo());
}

function removeSignature(signature $signature, $mysql) {
    $query = 'SET @disable_trigger = 1';
    $stmt = $mysql->prepare($query);
    $stmt->execute();

    $query = 'UPDATE signatures SET modifiedByID = :modifiedByID, modifiedByName = :modifiedByName, modifiedTime = :modifiedTime WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $signature->id);
    $stmt->bindValue(':modifiedByID', $_SESSION['characterID']);
    $stmt->bindValue(':modifiedByName', $_SESSION['characterName']);
    $stmt->bindValue(':modifiedTime', date('Y-m-d H:i:s', time()));
    $stmt->bindValue(':maskID', $signature->maskID);
    $success = @$stmt->execute();

    $query = 'SET @disable_trigger = NULL';
    $stmt = $mysql->prepare($query);
    $stmt->execute();

    $query = 'DELETE FROM signatures WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $signature->id);
    $stmt->bindValue(':maskID', $signature->maskID);
    $success = @$stmt->execute();

    if ($success) {
        // Log the user stats
        if ($signature->type != 'wormhole') {
            $query = 'INSERT INTO statistics (userID, characterID, maskID, signatures_deleted) VALUES (:userID, :characterID, :maskID, 1)
                ON DUPLICATE KEY UPDATE signatures_deleted = signatures_deleted + 1';
            $stmt = $mysql->prepare($query);
            $stmt->bindValue(':userID', $_SESSION['userID']);
            $stmt->bindValue(':characterID', $_SESSION['characterID']);
            $stmt->bindValue(':maskID', $signature->maskID);
            $success = $stmt->execute();
        }

        return array(true, $signature->id, null);
    }

    return array(false, null, $stmt->errorInfo());
}

function removeWormhole($wormhole, $mysql) {
    $wormhole = new wormhole($wormhole);

    $query = 'DELETE FROM wormholes WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $wormhole->id);
    $stmt->bindValue(':maskID', $wormhole->maskID);
    $success = @$stmt->execute();

    if ($success) {
        // Log the user stats
        $query = 'INSERT INTO statistics (userID, characterID, maskID, wormholes_deleted) VALUES (:userID, :characterID, :maskID, 1)
            ON DUPLICATE KEY UPDATE wormholes_deleted = wormholes_deleted + 1';
        $stmt = $mysql->prepare($query);
        $stmt->bindValue(':userID', $_SESSION['userID']);
        $stmt->bindValue(':characterID', $_SESSION['characterID']);
        $stmt->bindValue(':maskID', $wormhole->maskID);
        $success = $stmt->execute();

        return array(true, $wormhole->id, null);
    }

    return array(false, null, $stmt->errorInfo());
}

if (isset($_POST['signatures'])) {
    // Add signatures
    if (isset($_POST['signatures']['add'])) {
        foreach ($_POST['signatures']['add'] AS $request) {
            // initialize variables
            $result = null;
            $signature = null;
            $signature2 = null;
            $wormhole = null;

            if (isset($request['wormhole'])) {
                // Wormhole
                if (isset($request['signatures']) && count($request['signatures'])  > 1) {
                    list($result, $signature, $msg) = addSignature($request['signatures'][0], $mysql);
                    if ($result) {
                        $parent = $signature;
                        $request['wormhole']['initialID'] = $signature->id;
                        list($result, $signature2, $msg) = addSignature($request['signatures'][1], $mysql);
                        if ($result) {
                            $child = $signature2;
                            $request['wormhole']['secondaryID'] = $signature2->id;
                            list($result, $wormhole, $msg) = addWormhole($request['wormhole'], $mysql);
                        } else {
                            list($failedResult, $signature, $msg) = fetchSignature($request['wormhole']['initialID'], $mysql);
                            removeSignature($signature, $mysql);
                        }
                    }
                    $output['resultSet'][] = array('result' => $result, 'value' => $msg);
                    if ($result) {
                      $output['results'][] = array('wormhole' => $wormhole->output(), 'signatures' => array($parent->output(), $child->output()));
                    }
                } else {
                  $output['resultSet'][] = array('result' => false, 'value' => 'Wormhole signatures missing');
                }
            } else {
                // Regular Signature
                list($result, $signature, $msg) = addSignature($request, $mysql);
                $output['resultSet'][] = array('result' => $result, 'value' => $msg);
                if ($result) {
                  $output['results'][] = $signature->output();
                }
            }
        }
    }
    // Update signatures
    if (isset($_POST['signatures']['update'])) {
        foreach ($_POST['signatures']['update'] AS $request) {
            // initialize variables
            $result = null;
            $signature = null;
            $signature2 = null;
            $wormhole = null;

            if (isset($request['wormhole'])) {
                // Wormhole
                if (isset($request['signatures']) && count($request['signatures']) > 0 && isset($request['signatures'][0]['id'])) {
                    list($result, $signature, $msg) = fetchSignature($request['signatures'][0]['id'], $mysql);
                    if ($result && $signature) {
                        foreach ($request['signatures'][0] AS $property => $value) {
                            $signature->$property = $value;
                        }

                        // signature MUST be a wormhole type
                        $signature->type = 'wormhole';

                        list($result, $signature, $msg) = updateSignature($signature, $mysql);
                        if ($result && count($request['signatures']) == 2 && isset($request['signatures'][1]['id'])) {
                          list($result, $signature2, $msg) = fetchSignature($request['signatures'][1]['id'], $mysql);
                          if ($result && $signature2) {
                            foreach ($request['signatures'][1] AS $property => $value) {
                              $signature2->$property = $value;
                            }

                            // signature MUST be a wormhole type
                            $signature2->type = 'wormhole';

                            // make certain the two signatures life fields match or DB issues happen
                            $request['signatures'][1]['lifeTime'] = $signature->lifeTime;
                            $request['signatures'][1]['lifeLeft'] = $signature->lifeLeft;
                            $request['signatures'][1]['lifeLength'] = $signature->lifeLength;

                            list($result, $signature2, $msg) = updateSignature($signature2, $mysql);
                          } else {
                            // Used to be just a regular signature so we need ot add the 2nd signature
                            $request['signatures'][1]['lifeTime'] = $signature->lifeTime;
                            $request['signatures'][1]['lifeLeft'] = $signature->lifeLeft;
                            $request['signatures'][1]['lifeLength'] = $signature->lifeLength;

                            list($result, $signature2, $msg) = addSignature($request['signatures'][1], $mysql);
                          }
                        }
                    }

                    if ($result && $signature && $signature2) {
                        if (isset($request['wormhole']['id'])) {
                            list($result, $wormhole, $msg) = fetchWormhole($request['wormhole']['id'], $mysql);
                            if ($result && $wormhole) {
                                // Set wormhole to/from critical life
                                if (isset($request['wormhole']['life']) && $wormhole->life != $request['wormhole']['life'] && $request['wormhole']['life'] == 'critical') {
                                    $signature->lifeLeft = date('Y-m-d H:i:s', strtotime('4 hour'));
                                    $signature2->lifeLeft = date('Y-m-d H:i:s', strtotime('4 hour'));
                                    updateSignature($signature, $mysql);
                                    updateSignature($signature2, $mysql);
                                } else if (isset($request['wormhole']['life']) && $wormhole->life != $request['wormhole']['life'] && $request['wormhole']['life'] == 'stable') {
                                    $signature->lifeLeft = date('Y-m-d H:i:s', strtotime('+'.$signature->lifeLength.' seconds', strtotime($signature->lifeTime)));
                                    $signature2->lifeLeft = date('Y-m-d H:i:s', strtotime('+'.$signature2->lifeLength.' seconds', strtotime($signature2->lifeTime)));
                                    updateSignature($signature, $mysql);
                                    updateSignature($signature2, $mysql);
                                }

                                foreach ($request['wormhole'] AS $property => $value) {
                                    $wormhole->$property = $value;
                                }
                                list($result, $wormhole, $msg) = updateWormhole($wormhole, $mysql);
                            } else {
                                // Used to be just a regular signature
                                $request['wormhole']['initialID'] = $signature->id;
                                $request['wormhole']['secondaryID'] = $signature2->id;
                                list($result, $wormhole, $msg) = addWormhole($request['wormhole'], $mysql);
                            }
                        } else {
                            // Used to be just a regular signature
                            $request['wormhole']['initialID'] = $signature->id;
                            $request['wormhole']['secondaryID'] = $signature2->id;
                            list($result, $wormhole, $msg) = addWormhole($request['wormhole'], $mysql);
                        }
                    }

                    $output['resultSet'][] = array('result' => $result, 'value' => $msg);
                }
            } else if (isset($request['id'])) {
                // Regular Signature
                list($result, $signature, $msg) = fetchSignature($request['id'], $mysql);
                if ($result && $signature) {
                    if ($result && $signature->type == 'wormhole') {
                        // Used to be a wormhole
                        list($result, $wormhole, $msg) = findWormhole($signature->id, $mysql);
                        if ($result && $wormhole->initialID == $signature->id) {
                            list($result, $signature2, $msg) = fetchSignature($wormhole->secondaryID, $mysql);
                            removeSignature($signature2, $mysql);
                            removeWormhole(array('id' => $wormhole->id), $mysql);
                        } else {
                            list($result, $signature2, $msg) = fetchSignature($wormhole->initialID, $mysql);
                            removeSignature($signature2, $mysql);
                            removeWormhole(array('id' => $wormhole->id), $mysql);
                        }
                    }
                    foreach ($request AS $property => $value) {
                        $signature->$property = $value;
                    }

                    list($result, $signature, $msg) = updateSignature($signature, $mysql);
                    $output['resultSet'][] = array('result' => $result, 'value' => $msg);
                } else {
                    $output['resultSet'][] = array('result' => false, 'value' => 'Signature ID not found');
                }
            }
        }
    }
    // Delete signatures
    if (isset($_POST['signatures']['remove'])) {
        foreach ($_POST['signatures']['remove'] AS $request) {
            // initialize variables
            $result = null;
            $signature = null;
            $signature2 = null;
            $wormhole = null;

            if (isset($request['id'])) {
                list($result, $wormhole, $msg) = fetchWormhole($request['id'], $mysql);

                if ($result && $wormhole) {
                    list($result, $signature, $msg) = fetchSignature($wormhole->initialID, $mysql);
                    list($result, $signature2, $msg) = fetchSignature($wormhole->secondaryID, $mysql);
                }
            } else if ($request) {
                list($result, $signature, $msg) = fetchSignature($request, $mysql);
            }

            if ($signature && $signature->type == 'wormhole') {
                if ($signature2) {
                    list($result, $signature, $msg) = removeSignature($signature, $mysql);
                    list($result, $signature2, $msg) = removeSignature($signature2, $mysql);
                    list($result, $wormhole, $msg) = removeWormhole(array('id' => $wormhole->id), $mysql);
                } else if ($wormhole) {
                    list($result, $signature, $msg) = removeSignature($signature, $mysql);
                    list($result, $wormhole, $msg) = removeWormhole(array('id' => $wormhole->id), $mysql);
                } else {
                    list($result, $wormhole, $msg) = findWormhole($signature->id, $mysql);
                    if ($result && $wormhole) {
                        list($result, $signature, $msg) = fetchSignature($wormhole->initialID, $mysql);
                        list($result, $signature2, $msg) = fetchSignature($wormhole->secondaryID, $mysql);

                        list($result, $signature, $msg) = removeSignature($signature, $mysql);
                        list($result, $signature2, $msg) = removeSignature($signature2, $mysql);
                        list($result, $wormhole, $msg) = removeWormhole(array('id' => $wormhole->id), $mysql);
                    }
                }
                $output['resultSet'][] = array('result' => $result, 'value' => $msg);
            } else if ($signature) {
                list($result, $signature, $msg) = removeSignature($signature, $mysql);
                $output['resultSet'][] = array('result' => $result, 'value' => $msg);
            } else {
                $output['resultSet'][] = array('result' => false, 'value' => 'Signature ID not found');
            }
        }
    }
}
